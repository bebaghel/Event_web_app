import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Plus,
  Type,
  Link as LinkIcon,
  Building2,
  Users,
  FileText,
  ArrowLeft,
  Edit2,
  Trash2,
  List,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { useParams } from "react-router";
import { updateEvent } from "../../services/services";
import { toast } from "sonner";
import DeleteConfirm from "../../components/shared/DeleteConfirm";

type QuestionType = "text" | "options" | "website";
// | "social"
// | "company"
// | "terms"

interface Question {
  question_type: QuestionType;
  ques: string;
  options: any[];
  required: boolean;
  _id?: string;
}

interface RegistrationQuestionsProps {
  event_ques?: Question[];
  fetchEvent: () => void;
}

export default function RegistrationQuestions({
  event_ques = [],
  fetchEvent,
}: RegistrationQuestionsProps) {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [question, setQuestion] = useState("");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<any>([]);
  const [socialPlatform, setSocialPlatform] = useState("");
  const [registrationQuestions, setRegistrationQuestions] = useState<
    Question[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isDelete, setIsDelete] = useState(false);

  useEffect(() => {
    if (event_ques?.length) setRegistrationQuestions(event_ques);
  }, [event_ques]);

  // Add or Update Question
  const handleSaveQuestion = async () => {
    if (!question.trim()) return toast.error("Question cannot be empty");
    // if (selectedType === "social" && !socialPlatform)
    //   return toast.error("Please select a platform");

    setLoading(true);
    const newQuestion: Question = {
      question_type: selectedType!,
      ques: question.trim(),
      options,
      required,
      _id: editingId || undefined,
    };

    let updatedQuestions: Question[];
    if (editingId) {
      // Update existing
      updatedQuestions = registrationQuestions.map((q) =>
        q._id === editingId ? newQuestion : q
      );
    } else {
      // Add new
      updatedQuestions = [...registrationQuestions, newQuestion];
    }

    setRegistrationQuestions(updatedQuestions);

    try {
      const res = await updateEvent(id!, {
        registration_questions: updatedQuestions,
      });
      if (res.data?.status) {
        toast.success(editingId ? "Question updated!" : "Question added!");
      } else toast.error("Failed to update event.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      resetForm();
      setOpen(false);
      fetchEvent();
    }
  };

  // Delete Question
  const handleDeleteQuestion = async () => {
    if (!editingId) return;
    const updated = registrationQuestions.filter((q) => q._id !== editingId);
    setRegistrationQuestions(updated);

    try {
      const res = await updateEvent(id!, { registration_questions: updated });
      if (res.data?.status) {
        toast.success("Question deleted!");
        fetchEvent();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question");
    } finally {
      setEditingId(null);
      setIsDelete(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setQuestion("");
    setRequired(false);
    setSelectedType(null);
    setSocialPlatform("");
    setOptions([]), setStep("select");
    setOpen(false);
    setEditingId(null);
    setLoading(false);
  };

  // Icons
  const icons = {
    text: <Type className="w-4 h-4" />,
    options: <List className="w-4 h-4" />,
    website: <LinkIcon className="w-4 h-4" />,
    // social: <Users className="w-4 h-4" />,
    // company: <Building2 className="w-4 h-4" />,
    // terms: <FileText className="w-4 h-4" />,
  };

  // Edit Handler
  const handleEditClick = (q: Question) => {
    setEditingId(q._id || null);
    setSelectedType(q.question_type);
    setQuestion(q.ques);
    setRequired(q.required);
    setOptions(q.options || []);
    setStep("configure");
    setOpen(true);
  };

  return (
    <>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Registration Questions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We will ask guests the following questions when they register.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Personal Info */}
        <Card className="dark:bg-gray-800 h-fit">
          <CardContent className="space-y-3">
            <h3 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Name",
                  value: "Full Name",
                  icon: <User className="h-5 w-5" />,
                },
                {
                  label: "Email",
                  value: "Required",
                  icon: <Mail className="h-5 w-5" />,
                },
                {
                  label: "Phone",
                  value: "Required",
                  icon: <Phone className="h-5 w-5" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-gray-400">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Questions */}
        <Card className="dark:bg-gray-800">
          <CardContent className="space-y-3">
            <h3 className="font-medium text-orange-500 dark:text-orange-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Custom Questions
            </h3>

            {/* List */}
            <div className="space-y-2">
              {registrationQuestions.length ? (
                registrationQuestions.map((q) => (
                  <div
                    key={q._id}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {icons[q.question_type]}
                      <span>{q.ques}</span>
                      {q.required && (
                        <span className="text-xs text-gray-400">
                          (Required)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(q)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(q._id!), setIsDelete(true);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No custom questions added yet.
                </p>
              )}
            </div>

            {/* Add / Edit Dialog */}
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                  setEditingId(null); // ✅ reset editing state when dialog closes
                  setStep("select");
                }
              }}
            >
              {!editingId && (
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent className="sm:max-w-md bg-white dark:bg-[#1b1b1e] text-gray-900 dark:text-white rounded-xl">
                {step === "select" ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        {editingId ? "Edit" : "Add"} Question
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {(
                        [
                          { type: "text", label: "Text", icon: <Type /> },
                          {
                            type: "options",
                            label: "Options",
                            icon: <List />,
                          },
                          {
                            type: "website",
                            label: "Website / URL",
                            icon: <LinkIcon />,
                          },
                          // { type: "social", label: "Social", icon: <Users /> },
                          // {
                          //   type: "company",
                          //   label: "Company",
                          //   icon: <Building2 />,
                          // },
                          // { type: "terms", label: "Terms", icon: <FileText /> },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.type}
                          onClick={() => {
                            setSelectedType(item.type);
                            setStep("configure");
                          }}
                          className="p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex flex-col items-center gap-2 transition"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      {!editingId && (
                        <button
                          onClick={() => setStep("select")}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      <DialogTitle>
                        {editingId ? "Edit Question" : "Add Question"}
                      </DialogTitle>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm mb-1 block">Question</label>
                        <Input
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Enter question"
                          className="dark:bg-gray-800 dark:border-gray-700"
                          autoFocus
                          autoCapitalize="true"
                        />
                      </div>

                      {selectedType === "options" && (
                        <div className="space-y-2">
                          <label className="text-sm mb-1 block">Options</label>

                          {options.length ? (
                            <div className="space-y-2">
                              {options.map((opt: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...options];
                                      updated[idx] = e.target.value;
                                      setOptions(updated);
                                    }}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setOptions(
                                        options.filter(
                                          (_: any, i: number) => i !== idx
                                        )
                                      )
                                    }
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              No options added yet.
                            </p>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setOptions([...options, ""])}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Option
                          </Button>
                        </div>
                      )}

                      {/* Required Switch */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Required</span>
                        <Switch
                          checked={required}
                          onCheckedChange={setRequired}
                        />
                      </div>

                      <Button
                        onClick={handleSaveQuestion}
                        disabled={loading}
                        className={`w-full bg-purple-600 hover:bg-purple-700 text-white ${
                          loading && "cursor-not-allowed"
                        }`}
                      >
                        {editingId ? "Save Changes" : "Add Question"}
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirm
        open={isDelete}
        onClose={() => setIsDelete(false)}
        message="Are you sure to delete"
        onConfirm={handleDeleteQuestion}
      />
    </>
  );
}
