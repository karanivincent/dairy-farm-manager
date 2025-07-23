import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, PencilIcon, TrashIcon, PrinterIcon, ShareIcon, QrCodeIcon,
  InformationCircleIcon, HeartIcon, ChartBarIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
// Remove unused imports - using native HTML elements instead
import { TabNavigation, TabContent } from '../../components/common/TabNavigation';
import { CattleProfileCard } from '../../components/cattle/detail/CattleProfileCard';
import { CattleInfoSection } from '../../components/cattle/detail/CattleInfoSection';
import { CattleOffspringList } from '../../components/cattle/detail/CattleOffspringList';
import { CattleProductionChart } from '../../components/cattle/detail/CattleProductionChart';
import { CattleHealthTimeline } from '../../components/cattle/detail/CattleHealthTimeline';
import { cattleApi } from '../../lib/api/cattle.api';
import type { Production } from '../../types/production.types';

export function CattleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: cattle, isLoading, error } = useQuery({
    queryKey: ['cattle', id],
    queryFn: async () => {
      if (!id) throw new Error('Cattle ID is required');
      return await cattleApi.getById(parseInt(id));
    },
    enabled: !!id,
  });

  const { data: offspring = [] } = useQuery({
    queryKey: ['cattle', id, 'offspring'],
    queryFn: async () => {
      if (!id) return [];
      return await cattleApi.getOffspring(parseInt(id));
    },
    enabled: !!id,
  });

  const { data: productionHistory = [] } = useQuery({
    queryKey: ['cattle', id, 'production'],
    queryFn: async () => {
      if (!id) return [];
      return await cattleApi.getProductionHistory(parseInt(id)) as Production[];
    },
    enabled: !!id,
  });

  const handleEdit = () => {
    navigate(`/cattle/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this cattle record? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      console.log('Delete cattle:', id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && cattle) {
      try {
        await navigator.share({
          title: `Cattle: ${cattle.name}`,
          text: `View details for ${cattle.name} (Tag: ${cattle.tagNumber})`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleQRCode = () => {
    // TODO: Implement QR code generation
    console.log('Generate QR code for cattle:', id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !cattle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Failed to load cattle details
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'Cattle not found'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const age = cattle.birthDate ? calculateAge(cattle.birthDate) : 'Unknown';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <InformationCircleIcon className="h-5 w-5" /> },
    { id: 'production', label: 'Production', icon: <ChartBarIcon className="h-5 w-5" />, badge: productionHistory.length },
    { id: 'offspring', label: 'Offspring', icon: <UserGroupIcon className="h-5 w-5" />, badge: offspring.length },
    { id: 'health', label: 'Health', icon: <HeartIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/cattle')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Cattle List
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{cattle.name}</h1>
            <p className="text-gray-600">Tag: {cattle.tagNumber}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
            <div className="hidden md:flex gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleQRCode}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mb-8">
        <CattleProfileCard cattle={cattle} age={age} />
      </div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        defaultTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      <div className="space-y-6">
        <TabContent activeTab={activeTab} tabId="overview">
          <CattleInfoSection cattle={cattle} offspringCount={offspring.length} />
        </TabContent>

        <TabContent activeTab={activeTab} tabId="production">
          <CattleProductionChart productions={productionHistory} />
        </TabContent>

        <TabContent activeTab={activeTab} tabId="offspring">
          <CattleOffspringList offspring={offspring} />
        </TabContent>

        <TabContent activeTab={activeTab} tabId="health">
          <CattleHealthTimeline cattleId={cattle.id.toString()} />
        </TabContent>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex justify-around">
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleQRCode}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <QrCodeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function calculateAge(birthDate: string | undefined): string {
  if (!birthDate) return 'Unknown';
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                      (today.getMonth() - birth.getMonth());
  
  if (ageInMonths < 12) {
    return `${ageInMonths} months`;
  }
  
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  
  if (months === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  
  return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
}