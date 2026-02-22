'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import {
  getDigitalArtistById,
  mockPhysicalArtists,
  type ProductStyle,
  type RoyaltySplit,
  royaltyPresets,
} from '@/lib/coCreateData';
import { ChevronRight } from 'lucide-react';

const productStyles: ProductStyle[] = [
  'hoodie',
  'poster',
  'vinyl_figure',
  'sneakers',
  'tshirt',
  'hoodie_limited',
  'art_print',
  'collectible',
];

export default function DigitalArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artist = getDigitalArtistById(id || '');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedStyle, setSelectedStyle] = useState<ProductStyle | null>(null);
  const [brief, setBrief] = useState({
    productDescription: '',
    designVision: '',
    targetAudience: '',
    estimatedSupply: 100,
  });
  const [royaltyChoice, setRoyaltyChoice] = useState<RoyaltySplit>('balanced');
  const [selectedPhysicalArtist, setSelectedPhysicalArtist] = useState<string | null>(null);

  if (!artist) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Artist not found</p>
        </div>
      </Layout>
    );
  }

  const handleNext = () => {
    if (step === 1 && !selectedStyle) return;
    if (step === 2 && !brief.designVision) return;
    if (step === 3 && !selectedPhysicalArtist) return;
    if (step < 4) setStep((step + 1) as any);
  };

  const handleSubmit = async () => {
    // In a real app, this would submit to the blockchain/backend
    console.log({
      style: selectedStyle,
      brief,
      royalty: royaltyChoice,
      physicalArtist: selectedPhysicalArtist,
    });
    alert('IP request submitted! (Mock) Navigating to workspace...');
    setTimeout(() => navigate('/cocreate'), 1000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cocreate')}
            className="text-sm text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-1"
          >
            ← Back to Co-Create
          </button>

          {/* Artist Hero */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="pb-0">
              <div className="flex gap-6 items-start">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="h-24 w-24 rounded-lg"
                />
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{artist.name}</CardTitle>
                  <CardDescription className="text-base">{artist.bio}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {artist.styleTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">IP Rate</p>
                  <p className="text-xl font-bold">${artist.ipRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Response</p>
                  <p className="text-xl font-bold">{artist.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Subscribers</p>
                  <p className="text-xl font-bold">
                    {(artist.subscriberCount / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <Badge className="bg-green-100 text-green-800">Open</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Strip */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-900 mb-4">Portfolio</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {artist.portfolio.map((item, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  <p className="text-xs text-slate-600 mt-2">{item.style}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 mx-1 rounded ${
                    s <= step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Step {step} of 4
            </p>
          </div>

          {/* STEP 1: Product Style */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Product Style</CardTitle>
                <CardDescription>
                  What product will feature your design?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {productStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedStyle === style
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-medium text-slate-900 capitalize">
                        {style.replace(/_/g, ' ')}
                      </p>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!selectedStyle}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Creative Brief */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Describe Your Vision</CardTitle>
                <CardDescription>
                  Tell {artist.name} what you're imagining for this drop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Product Description
                  </label>
                  <textarea
                    value={brief.productDescription}
                    onChange={(e) =>
                      setBrief({ ...brief, productDescription: e.target.value })
                    }
                    placeholder="e.g., Premium 100% organic cotton hoodie, sustainably sourced..."
                    className="w-full p-3 border rounded-lg text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Design Vision
                  </label>
                  <textarea
                    value={brief.designVision}
                    onChange={(e) =>
                      setBrief({ ...brief, designVision: e.target.value })
                    }
                    placeholder="Describe the design, mood, and aesthetic you want..."
                    className="w-full p-3 border rounded-lg text-sm"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={brief.targetAudience}
                      onChange={(e) =>
                        setBrief({ ...brief, targetAudience: e.target.value })
                      }
                      placeholder="e.g., Gen Z, 18-30, tech-forward..."
                      className="w-full p-3 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Estimated Supply
                    </label>
                    <input
                      type="number"
                      value={brief.estimatedSupply}
                      onChange={(e) =>
                        setBrief({
                          ...brief,
                          estimatedSupply: parseInt(e.target.value) || 100,
                        })
                      }
                      min={10}
                      className="w-full p-3 border rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!brief.designVision}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Royalty Split */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Propose Royalty Split</CardTitle>
                <CardDescription>
                  How should profits be split between you, {artist.name}, and the platform?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(royaltyPresets).map(([key, split]) => (
                  <button
                    key={key}
                    onClick={() => setRoyaltyChoice(key as RoyaltySplit)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      royaltyChoice === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      {royaltyChoice === key && (
                        <Badge className="bg-blue-600">Selected</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">You (Creator)</p>
                        <p className="font-bold text-slate-900">{split.creator}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">{artist.name} (IP)</p>
                        <p className="font-bold text-slate-900">{split.ip}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Platform</p>
                        <p className="font-bold text-slate-900">{split.platform}%</p>
                      </div>
                    </div>

                    {/* Visual Split Bar */}
                    <div className="flex gap-0 mt-3 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600"
                        style={{ width: `${split.creator}%` }}
                      />
                      <div
                        className="bg-purple-600"
                        style={{ width: `${split.ip}%` }}
                      />
                      <div
                        className="bg-slate-300"
                        style={{ width: `${split.platform}%` }}
                      />
                    </div>
                  </button>
                ))}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Select Physical Artist & Confirm */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Select Physical Artist</CardTitle>
                <CardDescription>
                  Which brand will manufacture this drop?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPhysicalArtists.map((physicalArtist) => (
                  <button
                    key={physicalArtist.id}
                    onClick={() => setSelectedPhysicalArtist(physicalArtist.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedPhysicalArtist === physicalArtist.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={physicalArtist.avatar}
                        alt={physicalArtist.brand}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {physicalArtist.brand}
                        </p>
                        <p className="text-sm text-slate-600">
                          {physicalArtist.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Summary */}
                {selectedPhysicalArtist && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="pt-6">
                      <h4 className="font-bold text-slate-900 mb-3">
                        Request Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Product</span>
                          <span className="font-medium text-slate-900">
                            {selectedStyle?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">IP Rate</span>
                          <span className="font-medium text-slate-900">
                            ${artist.ipRate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Your Cut</span>
                          <span className="font-medium text-slate-900">
                            {royaltyPresets[royaltyChoice].creator}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">{artist.name}'s Cut</span>
                          <span className="font-medium text-slate-900">
                            {royaltyPresets[royaltyChoice].ip}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedPhysicalArtist}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Submit & Lock Fee to Escrow
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
