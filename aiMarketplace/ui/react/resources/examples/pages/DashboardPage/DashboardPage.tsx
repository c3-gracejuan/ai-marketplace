/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 */
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Document } from '@/Interfaces';
import { fetchDocuments } from '@/shared/api';
import { documentFiltersFromApplied } from '@/shared/documentFilters';
import { EXAMPLE_APP_TITLE } from '@/shared/constants';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import DocumentsFilterSidebar from '../../components/DocumentsFilterSidebar';
import { ExampleLegendSwatch } from '../../components/ExampleLegendSwatch';
import TopNav from '@/components/TopNav/TopNav';
import DashboardPageSkeleton from '@/components/LoadingStates/DashboardPageSkeleton';

const DASHBOARD_METRIC_ROWS = [
  {
    key: 'uploaded',
    label: 'TOTAL # OF DOCUMENTS UPLOADED',
    value: '211',
    delta: '5 (.5%)',
    deltaClass: 'text-accent',
    chartBg: 'bg-accent-weak',
    legendClass: 'bg-accent-strong',
  },
  {
    key: 'passed',
    label: 'DOCUMENTS PASSED',
    value: '#',
    delta: '5 (.5%)',
    deltaClass: 'text-success',
    chartBg: 'bg-success-weak',
    legendClass: 'bg-success-strong',
  },
  {
    key: 'failed',
    label: 'DOCUMENTS FAILED',
    value: '#',
    delta: '5 (.5%)',
    deltaClass: 'text-danger',
    chartBg: 'bg-danger-weak',
    legendClass: 'bg-danger-strong',
  },
  {
    key: 'ai',
    label: 'NO. OF AI RECOMMENDED-FAIL',
    value: '#',
    delta: '5 (.5%)',
    deltaClass: 'text-tertiary',
    chartBg: 'bg-tertiary-weak',
    legendClass: 'bg-tertiary',
  },
] as const;

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pageSize] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);

  const [selectedProject, setSelectedProject] = useState<{ text: string; value: string } | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<{ text: string; value: string } | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<{ text: string; value: string } | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<{ text: string; value: string } | null>(null);
  const [selectedUploadedBy, setSelectedUploadedBy] = useState<{ text: string; value: string } | null>(null);
  const [uploadDate, setUploadDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const [appliedProgram, setAppliedProgram] = useState<{ text: string; value: string } | null>(null);
  const [appliedOwner, setAppliedOwner] = useState<{ text: string; value: string } | null>(null);
  const [appliedChecklist, setAppliedChecklist] = useState<{ text: string; value: string } | null>(null);
  const [appliedUploadedBy, setAppliedUploadedBy] = useState<{ text: string; value: string } | null>(null);
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');

  const [expanded, setExpanded] = useState<string[]>(['documentDetails', 'uploadDetails']);

  useTheme();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = documentFiltersFromApplied({
          appliedProgram,
          appliedOwner,
          appliedChecklist,
          appliedUploadedBy,
          appliedSearchText,
        });

        const result = await fetchDocuments(pageSize, skip, filters);
        setDocuments(result.objs);
        setTotalCount(result.count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [pageSize, skip, appliedProgram, appliedOwner, appliedChecklist, appliedUploadedBy, appliedSearchText]);

  const handleApplyFilter = () => {
    setAppliedProgram(selectedProgram);
    setAppliedOwner(selectedOwner);
    setAppliedChecklist(selectedChecklist);
    setAppliedUploadedBy(selectedUploadedBy);
    setAppliedSearchText(searchText);
    setSkip(0);
  };

  const handleClearAll = () => {
    setSelectedProject(null);
    setSelectedProgram(null);
    setSelectedOwner(null);
    setSelectedChecklist(null);
    setSelectedUploadedBy(null);
    setUploadDate('');
    setSearchText('');
    setAppliedProgram(null);
    setAppliedOwner(null);
    setAppliedChecklist(null);
    setAppliedUploadedBy(null);
    setAppliedSearchText('');
    setSkip(0);
  };

  return (
    <>
      <TopNav
        title={EXAMPLE_APP_TITLE}
        tabs={[
          {
            title: 'Dashboard',
            path: '/',
          },
        ]}
      />
      <div className="p-4">
        {loading ? (
          <div key="dashboard-skeleton" className="c3-page-skeleton-enter">
            <DashboardPageSkeleton />
          </div>
        ) : (
          <div key="dashboard-content" className="c3-page-content-enter">
            <div className="c3-card">
              <div className="grid w-full grid-cols-1 divide-y divide-weak md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
                {DASHBOARD_METRIC_ROWS.map((m) => (
                  <div key={m.key} className="flex flex-col p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary">{m.label}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl">{m.value}</span>
                    </div>
                    <div className={cn('mb-2 flex items-center text-sm', m.deltaClass)}>
                      <span>{m.delta}</span>
                    </div>
                    <div className={cn('relative mb-2 h-20 overflow-hidden', m.chartBg)} />
                    <div className="mt-2 text-xs text-secondary">Last 30 days</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <ExampleLegendSwatch className={m.legendClass} />
                        Item 1
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-4 lg:flex-row">
              <DocumentsFilterSidebar
                expanded={expanded}
                onExpandedChange={setExpanded}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedProgram={selectedProgram}
                setSelectedProgram={setSelectedProgram}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
                selectedChecklist={selectedChecklist}
                setSelectedChecklist={setSelectedChecklist}
                selectedUploadedBy={selectedUploadedBy}
                setSelectedUploadedBy={setSelectedUploadedBy}
                uploadDate={uploadDate}
                setUploadDate={setUploadDate}
                onApply={handleApplyFilter}
                onClear={handleClearAll}
              />

              <div className="c3-card min-w-0 w-full">
                <div>
                  <div>
                    <h2 className="text-lg font-medium">Uploaded Documents</h2>
                    <p className="text-sm text-secondary">Subtitle</p>
                  </div>

                  <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center space-x-2 sm:flex-none">
                      <div className="relative flex-1 sm:flex-none">
                        <Input
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="Search documents..."
                          className="w-full sm:w-80 md:w-96"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center space-x-2 bg-accent px-6 py-2 text-base text-inverse transition-colors hover:bg-accent-hover focus:outline-none sm:w-auto"
                      >
                        <span>Upload New</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 w-full overflow-x-auto pt-4">
                  {error ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-danger">{error}</p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Checklist Applied</TableHead>
                            <TableHead>No. Attachments</TableHead>
                            <TableHead>Uploaded by</TableHead>
                            <TableHead>Uploaded at</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.map((doc) => {
                            const n = doc.attachments;
                            const attachCls =
                              n > 3 ? 'bg-success-weak text-success' : n > 1 ? 'bg-warning-weak text-warning' : 'bg-gray-weak text-gray';
                            return (
                              <TableRow key={doc.id}>
                                <TableCell>{doc.documentName}</TableCell>
                                <TableCell>{doc.program}</TableCell>
                                <TableCell>{doc.owner}</TableCell>
                                <TableCell>
                                  <span className="rounded bg-accent-weak px-2 py-1 text-sm text-accent">
                                    {doc.checklistApplied}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`rounded px-2 py-1 text-sm ${attachCls}`}>{n}</span>
                                </TableCell>
                                <TableCell>{doc.uploadedBy}</TableCell>
                                <TableCell>{doc.uploadedAt}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex items-center justify-between text-sm text-secondary">
                        <span>
                          Showing {documents.length} of {totalCount}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSkip(Math.max(0, skip - pageSize))}
                            disabled={skip === 0}
                            className="px-3 py-1 border border-weak rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkip(skip + pageSize)}
                            disabled={skip + pageSize >= totalCount}
                            className="px-3 py-1 border border-weak rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
