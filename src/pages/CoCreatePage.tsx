'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import {
  mockDigitalArtists,
  mockCollaborations,
  type Role,
  type DigitalArtist,
} from '@/lib/coCreateData';

export default function CoCreatePage() {
  const [role, setRole] = useState<Role>('physical');
  const navigate = useNavigate();

  const roleLabel = role === 'physical' ? '🎨 Physical Artist' : '💻 Digital Artist';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        {/* Header */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Co-Create Hub</h1>
              <p className="mt-2 text-lg text-slate-600">
                Collaborate with creators to make limited-edition drops
              </p>
            </div>

            {/* Role Toggle */}
            <div className="flex items-center gap-3 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => setRole('physical')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  role === 'physical'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎨 Physical
              </button>
              <button
                onClick={() => setRole('digital')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  role === 'digital'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💻 Digital
              </button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="collabs">My Collaborations</TabsTrigger>
            </TabsList>

            {/* BROWSE TAB */}
            <TabsContent value="browse" className="mt-8 space-y-6">
              {role === 'physical' ? (
                // Physical Artist - Browse Digital Artists
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Find Digital Artists
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Discover talented digital creators ready to collaborate
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mockDigitalArtists.map((artist) => (
                      <Card
                        key={artist.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <img
                                src={artist.avatar}
                                alt={artist.name}
                                className="h-12 w-12 rounded-full"
                              />
                              <div>
                                <CardTitle className="text-lg">
                                  {artist.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {artist.responseTime} response
                                </CardDescription>
                              </div>
                            </div>
                            {artist.isOpen && (
                              <Badge className="bg-green-100 text-green-800">
                                Open
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600">{artist.bio}</p>

                          {/* Style Tags */}
                          <div className="flex flex-wrap gap-2">
                            {artist.styleTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                            <div>
                              <p className="text-xs text-slate-500">IP Rate</p>
                              <p className="font-bold text-slate-900">
                                ${artist.ipRate}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">
                                Subscribers
                              </p>
                              <p className="font-bold text-slate-900">
                                {artist.subscriberCount.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Portfolio Preview */}
                          <div className="flex gap-2">
                            {artist.portfolio.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.title}
                                className="h-16 w-16 rounded object-cover"
                              />
                            ))}
                          </div>

                          <Button
                            onClick={() =>
                              navigate(`/cocreate/artist/${artist.id}`)
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Start Collaboration
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // Digital Artist - Browse IP Requests
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Incoming IP Requests
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Physical artists want to collaborate on limited drops
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {mockCollaborations.map((collab) => (
                      <Card key={collab.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {collab.physicalArtist.brand}
                              </CardTitle>
                              <CardDescription>
                                {collab.request.productStyle.replace(/_/g, ' ')}
                              </CardDescription>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800">
                              ${collab.request.ipFeeEscrow}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-slate-50 p-3 rounded">
                            <p className="text-xs text-slate-500 mb-1">
                              Design Vision
                            </p>
                            <p className="text-sm text-slate-900">
                              {collab.request.creativeBrief.designVision}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Supply</p>
                              <p className="font-bold text-slate-900">
                                {collab.request.creativeBrief.estimatedSupply}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Royalty</p>
                              <p className="font-bold text-slate-900">
                                {
                                  collab.request.royaltyBreakdown.ip
                                }
                                %
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() =>
                              navigate(`/cocreate/${collab.id}`)
                            }
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            Review Request
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* MY COLLABS TAB */}
            <TabsContent value="collabs" className="mt-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  My Collaborations
                </h2>
                <p className="mt-1 text-slate-600">
                  Track your active and completed projects
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {mockCollaborations.map((collab) => (
                  <Card key={collab.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {role === 'physical'
                              ? collab.digitalArtist.name
                              : collab.physicalArtist.brand}
                          </CardTitle>
                          <CardDescription>
                            {collab.request.status.replace(/_/g, ' ')}
                          </CardDescription>
                        </div>
                        {collab.actionNeeded && (
                          <Badge className="bg-red-100 text-red-800 animate-pulse">
                            ⚡ Action
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-50 p-3 rounded">
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          Status
                        </p>
                        <p className="text-sm text-slate-900">
                          {collab.request.status === 'pending_sample'
                            ? '📦 Awaiting sample review'
                            : collab.request.status === 'approved_for_mint'
                            ? '✅ Ready to mint!'
                            : 'In progress'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-500">Product</p>
                          <p className="text-sm font-medium text-slate-900">
                            {collab.request.productStyle.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Your Cut</p>
                          <p className="text-sm font-medium text-slate-900">
                            {role === 'physical'
                              ? collab.request.royaltyBreakdown.creator
                              : collab.request.royaltyBreakdown.ip}
                            %
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          navigate(`/cocreate/${collab.id}`)
                        }
                        className="w-full"
                        variant="outline"
                      >
                        Open Workspace
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
