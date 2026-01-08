"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiBookOpen, HiArrowLeft, HiPlus, HiXMark, HiSparkles, HiPaperClip } from "react-icons/hi2";
import { useTRPC, useMutation } from "@/server/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function NewCoursePage() {
  const router = useRouter();
  const api = useTRPC();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("BEGINNER");
  const [targetAudience, setTargetAudience] = useState("");
  const [courseOutcomes, setCourseOutcomes] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<string[]>([""]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([""]);
  const [estimatedHours, setEstimatedHours] = useState(10);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for Select component
  useEffect(() => {
    setMounted(true);
  }, []);

  const createCourseMutation = useMutation(api.admin.createCourse.mutationOptions({
    onSuccess: (data) => {
      toast.success("Course created! AI agent is now generating the course structure...");
      router.push(`/admin/courses/${data.courseId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create course");
    },
  }));

  const handleAddOutcome = () => {
    setCourseOutcomes([...courseOutcomes, ""]);
  };

  const handleRemoveOutcome = (index: number) => {
    setCourseOutcomes(courseOutcomes.filter((_, i) => i !== index));
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...courseOutcomes];
    newOutcomes[index] = value;
    setCourseOutcomes(newOutcomes);
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, ""]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  const handleAddYoutubeLink = () => {
    setYoutubeLinks([...youtubeLinks, ""]);
  };

  const handleRemoveYoutubeLink = (index: number) => {
    setYoutubeLinks(youtubeLinks.filter((_, i) => i !== index));
  };

  const handleYoutubeLinkChange = (index: number, value: string) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('word')) {
      toast.error('Only PDF and Word documents are supported');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'pdfs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        const errorMessage = errorData.error || `Upload failed with status ${response.status}`;
        console.error('[PDF Upload] Error response:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Upload succeeded but no URL returned');
      }
      
      setUploadedFiles([...uploadedFiles, { name: file.name, url: data.url }]);
      toast.success(`File "${file.name}" uploaded successfully`);
      console.log('[PDF Upload] Success:', data);
    } catch (error: any) {
      console.error('[PDF Upload] Error:', error);
      toast.error(error.message || 'Failed to upload file. Check console for details.');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine uploaded files and URL materials
    const allMaterials = [
      ...materials.filter(m => m.trim() !== ""),
      ...uploadedFiles.map(f => f.url),
    ];

    createCourseMutation.mutate({
      title,
      description,
      category: category || null,
      difficulty,
      targetAudience: targetAudience || null,
      courseOutcomes: courseOutcomes.filter(o => o.trim() !== ""),
      materials: allMaterials,
      youtubeLinks: youtubeLinks.filter(l => l.trim() !== ""),
      estimatedHours,
    });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <HiSparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Course</h1>
            <p className="text-slate-400">
              Fill in the course details. AI will generate modules and lessons automatically.
            </p>
          </div>
        </div>
      </motion.header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription>Essential course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Course Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to Machine Learning"
                    className="bg-slate-800 border-white/10 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    className="bg-slate-800 border-white/10 text-white"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-300">
                      Category
                    </Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="bg-slate-800 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-slate-300">
                      Difficulty
                    </Label>
                    {mounted ? (
                      <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                        <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 h-9 flex items-center text-white text-sm">
                        {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-slate-300">
                    Target Audience
                  </Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Undergraduate students, Professionals"
                    className="bg-slate-800 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours" className="text-slate-300">
                    Estimated Hours
                  </Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    value={estimatedHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setEstimatedHours(0);
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num >= 0) {
                          setEstimatedHours(num);
                        }
                      }
                    }}
                    className="bg-slate-800 border-white/10 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Outcomes */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Course Outcomes</CardTitle>
                <CardDescription>What students will be able to do after completing this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={outcome}
                        onChange={(e) => handleOutcomeChange(index, e.target.value)}
                        placeholder="e.g., Students will be able to implement neural networks from scratch"
                        className="bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    {courseOutcomes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOutcome(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <HiXMark className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOutcome}
                  className="w-full border-white/10 text-slate-300 hover:text-white"
                >
                  <HiPlus className="w-4 h-4 mr-2" />
                  Add Outcome
                </Button>
              </CardContent>
            </Card>

            {/* Materials & Resources */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Materials & Resources</CardTitle>
                <CardDescription>PDFs, documents, or other materials for the AI to reference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* PDF Upload Section */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Upload PDFs or Documents</Label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 bg-slate-800/30">
                    <input
                      type="file"
                      id="pdf-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="pdf-upload"
                      className={`flex flex-col items-center justify-center cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      <HiPaperClip className="w-8 h-8 text-amber-400 mb-2" />
                      <span className="text-sm text-slate-300 mb-1">
                        {uploading ? 'Uploading...' : 'Click to upload PDF or Word document'}
                      </span>
                      <span className="text-xs text-slate-500">Max 50MB per file</span>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md">
                          <HiBookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300 flex-1 truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUploadedFile(index)}
                            className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                          >
                            <HiXMark className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Material URLs Section */}
                <div className="space-y-3 mt-6">
                  <Label className="text-slate-300">Or provide external URLs (PDFs, documents)</Label>
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={material}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        placeholder="https://example.com/material.pdf"
                        type="url"
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      {materials.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <HiXMark className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMaterial}
                    className="w-full border-white/10 text-slate-300 hover:text-white"
                  >
                    <HiPlus className="w-4 h-4 mr-2" />
                    Add Material URL
                  </Button>
                </div>

                <div className="space-y-3 mt-6">
                  <Label className="text-slate-300">YouTube Video Links</Label>
                  {youtubeLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={link}
                        onChange={(e) => handleYoutubeLinkChange(index, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        type="url"
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      {youtubeLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveYoutubeLink(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <HiXMark className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddYoutubeLink}
                    className="w-full border-white/10 text-slate-300 hover:text-white"
                  >
                    <HiPlus className="w-4 h-4 mr-2" />
                    Add YouTube Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">AI Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <HiSparkles className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-white font-medium">What happens next?</p>
                    <p className="text-xs text-slate-400">
                      After you create the course, our AI agent will:
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                  <li>Surf the web for relevant course materials</li>
                  <li>Index and process your materials</li>
                  <li>Create course modules and lessons</li>
                  <li>Generate animations if needed</li>
                  <li>Verify content quality</li>
                  <li>Save course in staging mode</li>
                </ul>
                <Badge variant="outline" className="w-full justify-center bg-amber-500/10 text-amber-400 border-amber-500/30">
                  Course will be in staging mode until you publish it
                </Badge>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCourseMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {createCourseMutation.isPending ? (
                  <>
                    <HiSparkles className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <HiSparkles className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}




