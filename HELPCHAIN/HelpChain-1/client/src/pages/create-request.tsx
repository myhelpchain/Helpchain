import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useTasksApi } from "@/hooks/use-tasks-api";
import { useWallet } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import {
  Loader2, ArrowLeft, ArrowRight, MapPin, Check,
  Users, Globe, Upload, Briefcase, Zap, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const CATEGORIES = [
  { value: "digital_work", label: "Digital", icon: Globe },
  { value: "design", label: "Design", icon: Zap },
  { value: "programming", label: "Code", icon: Briefcase },
  { value: "home_repairs", label: "Repairs", icon: MapPin },
  { value: "errands", label: "Errands", icon: Zap },
  { value: "physical_help", label: "Manual", icon: Users },
];

const formSchema = z.object({
  title: z.string().min(5, "Too short").max(100),
  description: z.string().min(20, "Provide more detail"),
  category: z.string().min(1, "Select category"),
  locationType: z.enum(["remote", "local"]),
  location: z.string().optional(),
  budget: z.coerce.number().min(500, "Min ₦500"),
  workerCount: z.coerce.number().min(1).max(50).default(1),
});

function CreateRequestContent() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useFirebaseAuth();
  const { createTask, createTaskPending } = useTasksApi();
  const { availableBalance } = useWallet();
  const { formatLocal } = useLocalizationStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", category: "", locationType: "remote",
      location: "", budget: 1000, workerCount: 1,
    },
  });

  const watchAmount = form.watch("budget");
  const watchWorkerCount = form.watch("workerCount");
  const totalBudget = watchAmount * watchWorkerCount;
  const fee = Math.round(totalBudget * 0.06);
  const totalCost = totalBudget + fee;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (availableBalance < totalCost) {
      toast({ title: "Insufficient Funds", description: `You need ${formatLocal(totalCost)}`, variant: "destructive" });
      return;
    }
    try {
      await createTask(values);
      toast({ title: "Task Published!" });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const next = async () => {
    const fields: any = step === 1 ? ["category", "title", "description"] : ["budget", "workerCount"];
    const ok = await form.trigger(fields);
    if (ok) setStep(s => s + 1);
  };

  return (
    <MobileLayout hideBottomNav>
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">

        {/* Step Header */}
        <div className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6 bg-white rounded-b-[40px] shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
                className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center"
              >
                <ArrowLeft size={20} className="text-gray-900" strokeWidth={3} />
              </motion.button>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#0C6B38]' : 'w-2 bg-gray-100'}`} />
                ))}
              </div>
              <div className="w-11" />
           </div>

           <h1 className="text-2xl font-black text-gray-900 tracking-tight">
             {step === 1 ? "What's the task?" : step === 2 ? "Set your budget" : "Final Review"}
           </h1>
           <p className="text-gray-400 text-sm font-medium mt-1">
             {step === 1 ? "Give your request a clear title and description." : step === 2 ? "Fair pay ensures high quality help." : "Check everything is correct."}
           </p>
        </div>

        <div className="flex-1 px-6 pt-8 pb-32">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                           {CATEGORIES.map(cat => (
                             <button
                               key={cat.value}
                               type="button"
                               onClick={() => field.onChange(cat.value)}
                               className={`flex flex-col items-center justify-center p-4 rounded-[24px] border-2 transition-all ${field.value === cat.value ? 'bg-[#0C6B38] border-[#0C6B38] text-white shadow-green' : 'bg-white border-gray-50 text-gray-400'}`}
                             >
                               <cat.icon size={20} className="mb-2" />
                               <span className="text-[10px] font-black">{cat.label}</span>
                             </button>
                           ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Graphic Designer for Logo" className="h-16 rounded-2xl bg-white border-none shadow-sm font-bold text-lg px-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Explain what you need help with..." className="min-h-[140px] rounded-[24px] bg-white border-none shadow-sm font-medium p-6 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-white p-8 rounded-[40px] shadow-premium text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Budget per worker</p>
                       <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-black text-gray-300">₦</span>
                          <input
                            type="number"
                            className="text-5xl font-black text-gray-900 w-full max-w-[200px] text-center focus:outline-none"
                            {...form.register("budget")}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-6 rounded-[32px] border border-gray-50 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Workers</p>
                          <input type="number" className="text-2xl font-black text-gray-900 w-full text-center focus:outline-none" {...form.register("workerCount")} />
                       </div>
                       <div className="bg-[#0C6B38]/5 p-6 rounded-[32px] border border-[#0C6B38]/10 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#0C6B38] mb-2">Service Fee</p>
                          <p className="text-2xl font-black text-[#0C6B38]">{formatLocal(fee)}</p>
                       </div>
                    </div>

                    <div className="p-6 bg-gray-900 rounded-[32px] flex items-center justify-between text-white shadow-xl">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Escrow</p>
                          <p className="text-xl font-black">{formatLocal(totalCost)}</p>
                       </div>
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <ShieldCheck className="text-green-400" />
                       </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                   <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-premium">
                       <div className="flex items-center gap-2 mb-6">
                         <div className="w-1 h-8 bg-[#0C6B38] rounded-full" />
                         <h3 className="text-xl font-black text-gray-900">Summary</h3>
                       </div>

                       <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Task</p>
                            <p className="font-bold text-gray-900">{form.getValues("title")}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Budget</p>
                            <p className="font-bold text-gray-900">{formatLocal(form.getValues("budget"))} x {form.getValues("workerCount")} workers</p>
                         </div>
                         <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-gray-900 font-black">Grand Total</span>
                            <span className="text-2xl font-black text-[#0C6B38]">{formatLocal(totalCost)}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                       <Zap size={18} className="text-amber-600 shrink-0" />
                       <p className="text-[11px] text-amber-900 font-medium leading-tight">
                         Your funds will be held securely in escrow and only released when you approve the work.
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Nav */}
              <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
                 <div className="mx-auto max-w-lg glass-card rounded-[32px] p-4 flex gap-4 shadow-premium-lg border-white/60">
                    {step === 3 ? (
                      <motion.button
                        type="submit"
                        disabled={createTaskPending}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-[#0C6B38] text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-green"
                      >
                        {createTaskPending ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Publish Task</>}
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={next}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-gray-900 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                      >
                        Continue <ArrowRight size={20} strokeWidth={3} />
                      </motion.button>
                    )}
                 </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MobileLayout>
  );
}

export default function CreateRequest() {
  return (
    <ProtectedRoute>
      <CreateRequestContent />
    </ProtectedRoute>
  );
}
