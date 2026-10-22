import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { setSearchCompanyByText } from "@/redux/companySlice";
import { PageShell, PageContainer } from "../layout/PageShell";
import { Building2, Search, Sparkles, Users } from "lucide-react";

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { companies, searchCompanyByText } = useSelector((s) => s.company);

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch]);

  const filteredCount = useMemo(() => {
    if (!searchCompanyByText) return companies?.length || 0;
    const q = searchCompanyByText.toLowerCase();
    return (companies || []).filter((c) => c?.name?.toLowerCase().includes(q)).length;
  }, [companies, searchCompanyByText]);

  const total = companies?.length || 0;

  return (
    <PageShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_50%_at_50%_-15%,rgba(124,58,237,0.1),transparent)]" />
      <Navbar />
      <PageContainer className="py-8 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 p-6 text-white shadow-2xl sm:p-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Employers
          </span>
          <h1 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl">Companies directory</h1>
          <p className="relative mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
            Har employer ka profile yahan — logo, naam, aur jobs ke saath consistent branding.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Button
              className="rounded-full bg-white text-slate-900 hover:bg-white/90"
              onClick={() => navigate("/admin/companies/create")}
            >
              Nayi company
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate("/admin/jobs")}
            >
              Sab jobs
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate("/admin/insights")}
            >
              Insights
            </Button>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Building2 className="h-4 w-4 text-brand-600" />
              Total companies
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{total}</p>
            <p className="mt-2 text-xs text-slate-500">Platform par registered</p>
          </div>
          <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700">
              <Search className="h-4 w-4" />
              Search match
            </p>
            <p className="mt-1 text-3xl font-black text-violet-950">{filteredCount}</p>
            <p className="mt-2 text-xs text-violet-600">Naam filter ke mutabiq</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
              <Users className="h-4 w-4" />
              Hiring
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-950">
              <Link to="/admin/pipeline" className="underline-offset-2 hover:underline">
                Pipeline
              </Link>
              {" · "}
              <Link to="/admin/jobs/create" className="underline-offset-2 hover:underline">
                Post job
              </Link>
            </p>
            <p className="mt-2 text-xs text-emerald-700">Candidates flow yahan se</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 via-white to-cyan-50/40 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Employer profile tips</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Official company name + short description — students trust clarity.",
              "Logo sharp ho (square, readable) taake listings professional lagen.",
              "Ek hi company ke neeche saari jobs rakhein — duplicate employers avoid karein.",
              "Jobs post karte waqt company select zaroor verify karein.",
            ].map((line) => (
              <li
                key={line}
                className="flex gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Input
            className="w-full max-w-md rounded-xl border-slate-200"
            placeholder="Company naam se filter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/companies/create")}>New Company</Button>
        </div>

        <div className="mt-6">
          <CompaniesTable />
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default Companies;
