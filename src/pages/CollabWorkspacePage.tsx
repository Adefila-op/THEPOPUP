'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import {
  getCollaborationById,
  royaltyPresets,
  type Message,
  type CollabStatus,
} from '@/lib/coCreateData';
import {
  Send,
  Check,
  X,
  Package,
  MessageSquare,
  Eye,
} from 'lucide-react';

export default function CollabWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collaboration = getCollaborationById(id || '');

  // View mode toggle (to demo both perspectives)
  const [viewAs, setViewAs] = useState<'physical' | 'digital'>('physical');
  const [activeTab, setActiveTab] = useState<'messages' | 'sample' | 'info'>(
    'messages'
  );
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(collaboration?.request.messages || []);
  const [acceptanceDecision, setAcceptanceDecision] = useState<'pending' | 'accepted' | 'declined'>(
    'pending'
  );
  const [sampleStatus, setSampleStatus] = useState(
    collaboration?.request.sampleReview?.status || 'pending'
  );
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showMintConfirm, setShowMintConfirm] = useState(false);

  if (!collaboration) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Collaboration not found</p>
        </div>
      </Layout>
    );
  }

  const isPhysicalArtist = viewAs === 'physical';
  const request = collaboration.request;
  const physicalArtist = collaboration.physicalArtist;
  const digitalArtist = collaboration.digitalArtist;

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: isPhysicalArtist ? 'physical_artist' : 'digital_artist',
      type: 'artist',
      content: messageText,
      timestamp: Date.now(),
      senderName: isPhysicalArtist ? physicalArtist.name : digitalArtist.name,
      avatar: isPhysicalArtist ? physicalArtist.avatar : digitalArtist.avatar,
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleAcceptRequest = () => {
    setAcceptanceDecision('accepted');
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'digital_artist',
        type: 'system',
        content: `${digitalArtist.name} accepted the IP request. IP fee released from escrow. Now awaiting sample review.`,
        timestamp: Date.now(),
        senderName: 'System',
      },
    ]);
  };

  const handleDeclineRequest = () => {
    setAcceptanceDecision('declined');
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'digital_artist',
        type: 'system',
        content: `${digitalArtist.name} declined the IP request. IP fee refunded to ${physicalArtist.name}.`,
        timestamp: Date.now(),
        senderName: 'System',
      },
    ]);
  };

  const handleApprovesSample = () => {
    setSampleStatus('approved');
    if (sampleStatus === 'revision_requested') {
      setMessages([
        ...messages,
        {
          id: `msg-${Date.now()}`,
          sender: isPhysicalArtist ? 'physical_artist' : 'digital_artist',
          type: 'system',
          content: `${
            isPhysicalArtist ? physicalArtist.name : digitalArtist.name
          } approved the revised sample.`,
          timestamp: Date.now(),
          senderName: 'System',
        },
      ]);
    }
  };

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    setSampleStatus('revision_requested');
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: isPhysicalArtist ? 'physical_artist' : 'digital_artist',
        type: 'artist',
        content: `Revision requested: ${revisionNotes}`,
        timestamp: Date.now(),
        senderName: isPhysicalArtist ? physicalArtist.name : digitalArtist.name,
        avatar: isPhysicalArtist ? physicalArtist.avatar : digitalArtist.avatar,
      },
    ]);
    setRevisionNotes('');
  };

  const handleMint = async () => {
    // In a real app, this would mint the ERC-721 with royalty split on Base
    alert(
      `Minting co-signed drop:\n${request.productStyle}\nPhysical: ${physicalArtist.name}\nDigital: ${digitalArtist.name}\n\nRoyalties baked in: Creator ${request.royaltyBreakdown.creator}%, IP ${request.royaltyBreakdown.ip}%, Platform ${request.royaltyBreakdown.platform}%`
    );
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'digital_artist',
        type: 'system',
        content: `🎉 Drop minted! ERC-721 on Base with royalty split locked forever.`,
        timestamp: Date.now(),
        senderName: 'System',
      },
    ]);
    setShowMintConfirm(false);
  };

  // Both sides approved?
  const bothApproved =
    sampleStatus === 'approved' &&
    collaboration.request.sampleReview?.physicalArtistApproval &&
    collaboration.request.sampleReview?.digitalArtistApproval;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/cocreate')}
              className="text-sm text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-1"
            >
              ← Back to Co-Create
            </button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Collaboration Workspace
                </h1>
                <p className="text-slate-600 mt-1">
                  {request.productStyle.replace(/_/g, ' ')} •{' '}
                  {request.status.replace(/_/g, ' ')}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm ring-1 ring-slate-200">
                <button
                  onClick={() => setViewAs('physical')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    viewAs === 'physical'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎨 Physical
                </button>
                <button
                  onClick={() => setViewAs('digital')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    viewAs === 'digital'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💻 Digital
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {isPhysicalArtist ? physicalArtist.name : digitalArtist.name}
              </Badge>
              <Badge variant="outline">
                {!isPhysicalArtist ? physicalArtist.name : digitalArtist.name}
              </Badge>
              {acceptanceDecision === 'accepted' && (
                <Badge className="bg-green-100 text-green-800">✅ Accepted</Badge>
              )}
              {sampleStatus === 'approved' && (
                <Badge className="bg-blue-100 text-blue-800">📦 Sample Approved</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* LEFT: Messages & Info */}
            <div className="col-span-2">
              {/* Tabs */}
              <div className="flex gap-0 mb-4 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'messages'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('sample')}
                  className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'sample'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Sample
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'info'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Details
                </button>
              </div>

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                <Card>
                  <CardContent className="p-0 flex flex-col h-[500px]">
                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                      {messages.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">
                          No messages yet. Start the conversation!
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              msg.sender === (isPhysicalArtist ? 'physical_artist' : 'digital_artist')
                                ? 'flex-row-reverse'
                                : ''
                            }`}
                          >
                            {msg.avatar && msg.type !== 'system' && (
                              <img
                                src={msg.avatar}
                                alt={msg.senderName}
                                className="h-8 w-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <div
                              className={`flex-1 ${
                                msg.sender === (isPhysicalArtist ? 'physical_artist' : 'digital_artist')
                                  ? 'text-right'
                                  : ''
                              }`}
                            >
                              {msg.type === 'system' ? (
                                <div className="text-xs text-slate-500 italic text-center py-2">
                                  {msg.content}
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs text-slate-600 mb-1">
                                    {msg.senderName}
                                  </p>
                                  <div
                                    className={`inline-block p-3 rounded-lg max-w-xs ${
                                      msg.sender === (isPhysicalArtist ? 'physical_artist' : 'digital_artist')
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-slate-900 border'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4 bg-white">
                      <div className="flex gap-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          className="text-sm"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SAMPLE TAB */}
              {activeTab === 'sample' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Review</CardTitle>
                    <CardDescription>
                      Both parties review the physical prototype
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Sample Images */}
                    <div className="bg-slate-100 rounded-lg p-8 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <Package className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-600">
                          Sample image placeholder
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          {sampleStatus === 'pending'
                            ? 'Awaiting sample delivery'
                            : sampleStatus === 'approved'
                            ? 'Sample approved ✓'
                            : 'Revision in progress'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-base">
                            🎨 {physicalArtist.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-500 mb-3">Status</p>
                          <div className="flex gap-2">
                            {sampleStatus === 'approved' ? (
                              <Badge className="bg-green-100 text-green-800">
                                ✓ Approved
                              </Badge>
                            ) : sampleStatus === 'revision_requested' ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ⚡ Revision
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-200 text-slate-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-base">
                            💻 {digitalArtist.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-500 mb-3">Status</p>
                          <div className="flex gap-2">
                            {sampleStatus === 'approved' ? (
                              <Badge className="bg-green-100 text-green-800">
                                ✓ Approved
                              </Badge>
                            ) : sampleStatus === 'revision_requested' ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ⚡ Revision
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-200 text-slate-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    {sampleStatus !== 'approved' && (
                      <div className="space-y-3">
                        <Button
                          onClick={handleApprovesSample}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Sample
                        </Button>

                        <div className="space-y-2">
                          <Textarea
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Request revision... (optional)"
                            className="text-sm resize-none"
                            rows={2}
                          />
                          <Button
                            onClick={handleRequestRevision}
                            disabled={!revisionNotes.trim()}
                            variant="outline"
                            className="w-full"
                          >
                            Request Revision
                          </Button>
                        </div>
                      </div>
                    )}

                    {sampleStatus === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Both parties approved! Ready to mint.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* DETAILS TAB */}
              {activeTab === 'info' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Collaboration Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brief */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Brief</h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Product:</span>{' '}
                          {request.creativeBrief.productDescription}
                        </p>
                        <p>
                          <span className="font-medium">Vision:</span>{' '}
                          {request.creativeBrief.designVision}
                        </p>
                        <p>
                          <span className="font-medium">Audience:</span>{' '}
                          {request.creativeBrief.targetAudience}
                        </p>
                        <p>
                          <span className="font-medium">Supply:</span>{' '}
                          {request.creativeBrief.estimatedSupply} units
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Timeline</h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Updated:</span>{' '}
                          {new Date(request.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-6">
              {/* Request Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {acceptanceDecision === 'pending' && isPhysicalArtist === false ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-900 font-medium">
                          ⏳ Waiting for your decision
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          IP fee ${request.ipFeeEscrow} held in escrow
                        </p>
                      </div>
                      <Button
                        onClick={handleAcceptRequest}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept Request
                      </Button>
                      <Button
                        onClick={handleDeclineRequest}
                        variant="destructive"
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  ) : acceptanceDecision === 'accepted' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Request accepted
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        Fee released to {digitalArtist.name}. Awaiting sample review.
                      </p>
                    </div>
                  ) : acceptanceDecision === 'declined' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 font-medium">
                        ✗ Request declined
                      </p>
                      <p className="text-xs text-red-700 mt-2">
                        Fee refunded to {physicalArtist.name}.
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Royalty Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Royalty Split</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex h-8 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600"
                      style={{ width: `${request.royaltyBreakdown.creator}%` }}
                    />
                    <div
                      className="bg-purple-600"
                      style={{ width: `${request.royaltyBreakdown.ip}%` }}
                    />
                    <div
                      className="bg-slate-300"
                      style={{ width: `${request.royaltyBreakdown.platform}%` }}
                    />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Creator ({physicalArtist.name})</span>
                      <span className="font-bold">{request.royaltyBreakdown.creator}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">IP ({digitalArtist.name})</span>
                      <span className="font-bold">{request.royaltyBreakdown.ip}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Platform</span>
                      <span className="font-bold">{request.royaltyBreakdown.platform}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mint Button */}
              {bothApproved && acceptanceDecision === 'accepted' && (
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base">Ready to Mint!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-700">
                      Both parties approved. Mint the co-signed drop on Base chain with royalty
                      split locked forever.
                    </p>
                    {showMintConfirm ? (
                      <div className="space-y-3 bg-white rounded p-3">
                        <p className="text-xs font-medium text-slate-900">
                          Confirm: Mint ERC-721?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleMint}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => setShowMintConfirm(false)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowMintConfirm(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        🎨 Mint Co-Signed Drop
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Artists Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Collaborators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={physicalArtist.avatar}
                      alt={physicalArtist.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {physicalArtist.name}
                      </p>
                      <p className="text-xs text-slate-500">{physicalArtist.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={digitalArtist.avatar}
                      alt={digitalArtist.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {digitalArtist.name}
                      </p>
                      <p className="text-xs text-slate-500">Digital Artist</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
