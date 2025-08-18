import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SharedRelationship } from '@/hooks/useSharedRelationships';

interface SharedRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  relationship?: SharedRelationship | null;
  groupId: string;
  title?: string;
  mode?: 'create' | 'edit' | 'copy';
  personalProfile?: any;
}

const SharedRelationshipModal: React.FC<SharedRelationshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  relationship,
  groupId,
  title,
  mode = 'create',
  personalProfile
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    type: 'client',
    deal_value: '',
    important_metrics: {} as Record<string, any>
  });

  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');

  // Initialize form data
  useEffect(() => {
    if (relationship && mode === 'edit') {
      setFormData({
        first_name: relationship.first_name,
        last_name: relationship.last_name,
        email: relationship.email || '',
        phone: relationship.phone || '',
        notes: relationship.notes || '',
        type: relationship.type,
        deal_value: relationship.deal_value?.toString() || '',
        important_metrics: relationship.important_metrics || {}
      });
    } else if (personalProfile && mode === 'copy') {
      setFormData({
        first_name: personalProfile.first_name,
        last_name: personalProfile.last_name,
        email: personalProfile.email || '',
        phone: personalProfile.phone || '',
        notes: personalProfile.notes || '',
        type: personalProfile.type,
        deal_value: '',
        important_metrics: {}
      });
    } else {
      // Reset form for create mode
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
        type: 'client',
        deal_value: '',
        important_metrics: {}
      });
    }
  }, [relationship, personalProfile, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMetric = () => {
    if (metricKey.trim() && metricValue.trim()) {
      setFormData(prev => ({
        ...prev,
        important_metrics: {
          ...prev.important_metrics,
          [metricKey]: metricValue
        }
      }));
      setMetricKey('');
      setMetricValue('');
    }
  };

  const handleRemoveMetric = (key: string) => {
    setFormData(prev => {
      const newMetrics = { ...prev.important_metrics };
      delete newMetrics[key];
      return {
        ...prev,
        important_metrics: newMetrics
      };
    });
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      return;
    }

    const submitData: any = {
      ...formData,
      group_id: groupId,
      deal_value: formData.deal_value ? parseFloat(formData.deal_value) : null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      notes: formData.notes.trim() || null
    };

    if (mode === 'edit' && relationship) {
      submitData.id = relationship.id;
    }

    await onSave(submitData);
    onClose();
  };

  const getTitle = () => {
    if (title) return title;
    if (mode === 'edit') return 'Edit Shared Lead';
    if (mode === 'copy') return 'Copy to Shared';
    return 'Add New Shared Lead';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deal Value */}
          <div>
            <Label htmlFor="deal_value">Deal Value ($)</Label>
            <Input
              id="deal_value"
              type="number"
              step="0.01"
              value={formData.deal_value}
              onChange={(e) => handleInputChange('deal_value', e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Important Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Important Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Metric name"
                  value={metricKey}
                  onChange={(e) => setMetricKey(e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddMetric}
                  disabled={!metricKey.trim() || !metricValue.trim()}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.important_metrics).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveMetric(key)}
                  >
                    {key}: {value} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!formData.first_name.trim() || !formData.last_name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharedRelationshipModal;