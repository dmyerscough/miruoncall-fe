'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const chartData = {
    incidents: [
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 00:12:31 GMT',
            description: '[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            id: 14388,
            incident_id: 'Q0WHRE9UJ5ERON',
            status: 'resolved',
            summary:
                '[#7559400] [FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 14:17:31 GMT',
            description: '[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)',
            id: 14410,
            incident_id: 'Q1F6PL9SVWDGXX',
            status: 'resolved',
            summary:
                '[#7560702] [FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 15:27:14 GMT',
            description:
                '[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)',
            id: 14412,
            incident_id: 'Q01WJ5A5ZI2WIK',
            status: 'resolved',
            summary:
                '[#7560804] [FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 16:09:29 GMT',
            description:
                '[FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)',
            id: 14415,
            incident_id: 'Q1CVZYZBVJDBKU',
            status: 'resolved',
            summary:
                '[#7560890] [FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 16:50:02 GMT',
            description:
                '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            id: 14417,
            incident_id: 'Q27G4H0GZVI6Q1',
            status: 'resolved',
            summary:
                '[#7560974] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 17:37:31 GMT',
            description:
                '[FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            id: 14419,
            incident_id: 'Q20AAULVYZY78B',
            status: 'resolved',
            summary:
                '[#7561050] [FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Tue, 27 May 2025 23:33:17 GMT',
            description:
                '[FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)',
            id: 14421,
            incident_id: 'Q2OAAH7YB644G8',
            status: 'resolved',
            summary:
                '[#7561995] [FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)',
            team: 98,
            title: '[FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: {
                created_at: 'Thu, 29 May 2025 06:37:19 GMT',
                summary: 'Test annotation',
            },
            created_at: 'Tue, 27 May 2025 23:49:14 GMT',
            description:
                '[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)',
            id: 14424,
            incident_id: 'Q19JSYBG5MNVP4',
            status: 'resolved',
            summary:
                '[#7562054] [FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 00:33:10 GMT',
            description: 'We need tcarr/DGXOBSERV-1713 deployed ',
            id: 14426,
            incident_id: 'Q1URVGSZJB2TD0',
            status: 'acknowledged',
            summary: '[#7562186] We need tcarr/DGXOBSERV-1713 deployed ',
            team: 98,
            title: 'We need tcarr/DGXOBSERV-1713 deployed ',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 06:04:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            id: 107685,
            incident_id: 'Q0VU1E0675G9QC',
            status: 'resolved',
            summary:
                '[#7562759] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 06:04:31 GMT',
            description:
                '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            id: 107690,
            incident_id: 'Q1HAKHDERVTYWY',
            status: 'resolved',
            summary:
                '[#7562760] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 07:54:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            id: 107693,
            incident_id: 'Q33I9YPYGH0CZK',
            status: 'resolved',
            summary:
                '[#7562956] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 07:54:37 GMT',
            description:
                '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            id: 107696,
            incident_id: 'Q197ET7M15DG6C',
            status: 'resolved',
            summary:
                '[#7562957] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 08:37:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)',
            id: 107698,
            incident_id: 'Q2AXIZCT4CVH2I',
            status: 'resolved',
            summary:
                '[#7563029] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 08:37:31 GMT',
            description:
                '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)',
            id: 107700,
            incident_id: 'Q17QYIEZO8DZJ3',
            status: 'resolved',
            summary:
                '[#7563030] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 08:45:30 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)',
            id: 107702,
            incident_id: 'Q35MFH1623SMS7',
            status: 'resolved',
            summary:
                '[#7563041] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:01:31 GMT',
            description: '[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            id: 107704,
            incident_id: 'Q2ZVCNI72JEQGI',
            status: 'resolved',
            summary: '[#7564209] [FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:09:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)',
            id: 107705,
            incident_id: 'Q20J6SV8C4PJFW',
            status: 'resolved',
            summary:
                '[#7564220] [FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:13:33 GMT',
            description: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)',
            id: 107708,
            incident_id: 'Q2I0VCG3NMWAIS',
            status: 'resolved',
            summary: '[#7564245] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:25:30 GMT',
            description:
                '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)',
            id: 107710,
            incident_id: 'Q08MNCGVW8EMOS',
            status: 'resolved',
            summary:
                '[#7564264] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)',
            team: 98,
            title: '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:27:30 GMT',
            description: '[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)',
            id: 107712,
            incident_id: 'Q3OYSFU6Y9ZAGM',
            status: 'resolved',
            summary:
                '[#7564267] [FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:43:31 GMT',
            description:
                '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)',
            id: 107714,
            incident_id: 'Q1KLCKJBQ699Y0',
            status: 'resolved',
            summary:
                '[#7564280] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 20:49:31 GMT',
            description:
                '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)',
            id: 107719,
            incident_id: 'Q0DZ4K7B22D9J1',
            status: 'resolved',
            summary:
                '[#7564290] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Wed, 28 May 2025 22:58:32 GMT',
            description: '[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            id: 107721,
            incident_id: 'Q24C9C5AQAY0HV',
            status: 'resolved',
            summary: '[#7564605] [FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Thu, 29 May 2025 13:43:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)',
            id: 108966,
            incident_id: 'Q1BX4Y7O1E0LHL',
            status: 'resolved',
            summary:
                '[#7566262] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Thu, 29 May 2025 13:43:31 GMT',
            description:
                '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)',
            id: 108967,
            incident_id: 'Q08PHH9U8N8EB6',
            status: 'resolved',
            summary:
                '[#7566263] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Thu, 29 May 2025 13:57:29 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)',
            id: 108969,
            incident_id: 'Q10X07WGW3CB12',
            status: 'resolved',
            summary:
                '[#7566279] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)',
            urgency: 'high',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Thu, 29 May 2025 18:11:30 GMT',
            description:
                '[FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            id: 108971,
            incident_id: 'Q0NF7NFN5WFIOX',
            status: 'resolved',
            summary:
                '[#7566779] [FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Thu, 29 May 2025 20:24:16 GMT',
            description: '[FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)',
            id: 108972,
            incident_id: 'Q2GI3N9WSKWU71',
            status: 'resolved',
            summary: '[#7567138] [FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Fri, 30 May 2025 09:15:03 GMT',
            description:
                '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            id: 110243,
            incident_id: 'Q0ID0O2R64KEAJ',
            status: 'resolved',
            summary:
                '[#7568767] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Fri, 30 May 2025 15:28:03 GMT',
            description:
                '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            id: 110245,
            incident_id: 'Q0TLSX5XCB0X99',
            status: 'resolved',
            summary:
                '[#7569274] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Fri, 30 May 2025 16:30:32 GMT',
            description: '[FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)',
            id: 110248,
            incident_id: 'Q3YFEOPO5MLB9E',
            status: 'resolved',
            summary:
                '[#7569392] [FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)',
            urgency: 'low',
        },
        {
            actionable: null,
            annotation: null,
            created_at: 'Fri, 30 May 2025 21:24:02 GMT',
            description:
                '[FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)',
            id: 110251,
            incident_id: 'Q13SH0XE1MCQXI',
            status: 'resolved',
            summary:
                '[#7570087] [FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)',
            team: 98,
            title: '[FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)',
            urgency: 'low',
        },
    ],
    summary: {
        '2025-05-25': {
            high: 0,
            low: 0,
        },
        '2025-05-26': {
            high: 0,
            low: 0,
        },
        '2025-05-27': {
            high: 2,
            low: 6,
        },
        '2025-05-28': {
            high: 6,
            low: 10,
        },
        '2025-05-29': {
            high: 1,
            low: 4,
        },
        '2025-05-30': {
            high: 0,
            low: 4,
        },
        '2025-05-31': {
            high: 0,
            low: 0,
        },
    },
    team: {
        alias: null,
        created_at: '2025-05-28T05:11:24',
        id: 98,
        last_checked: '2025-06-01T06:12:45.616871',
        name: 'DGXCloud Observability (Panoptes)',
        summary: 'DGXCloud Observability (Panoptes)',
        team_id: 'PJ1BDNM',
    },
}

const chartConfig = {
    alerts: {
        label: 'Alert Priority',
    },
    high: {
        label: 'High Priority',
        color: '#dc2626',
    },
    low: {
        label: 'Low Priority',
        color: '#fbbf24',
    },
} satisfies ChartConfig

export function ChartAreaInteractive() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState('90d')
    const [hiddenSeries, setHiddenSeries] = React.useState<string[]>([])
    const [selectedSeries, setSelectedSeries] = React.useState<string | null>(null)
    const [chartDimensions, setChartDimensions] = React.useState({ width: 0, height: 400 })
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange('7d')
        }
    }, [isMobile])

    React.useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect
                setChartDimensions({
                    width: width > 0 ? width : 0,
                    height: 400,
                })
            }
        })

        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    // Transform the summary data into chart format
    const incidentSummaryFormatted = React.useMemo(() => {
        return Object.entries(chartData.summary).map(([date, values]) => ({
            date,
            high: values.high,
            low: values.low,
        }))
    }, [])

    const handleLegendClick = (dataKey: string) => {
        const allDataKeys = Object.keys(incidentSummaryFormatted[0] || {}).filter((key) => key !== 'date')

        if (selectedSeries === dataKey) {
            setSelectedSeries(null)
            setHiddenSeries([])
        } else {
            setSelectedSeries(dataKey)
            setHiddenSeries(allDataKeys.filter((key) => key !== dataKey))
        }
    }

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Total Alerts</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        A total of <span className=" font-semibold">{chartData.incidents.length}</span> {chartData.incidents.length > 1 ? `alerts` : `alert`}{' '}
                        were triggered during this time period.
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent ref={containerRef} className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} style={{ height: chartDimensions.height, width: '100%' }}>
                    <BarChart accessibilityLayer data={incidentSummaryFormatted} width={chartDimensions.width} height={chartDimensions.height}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend
                            content={(props) => (
                                <ChartLegendContent
                                    payload={props.payload}
                                    onDataKeyClick={handleLegendClick}
                                    hiddenSeries={hiddenSeries}
                                    showOnlySelected={true}
                                />
                            )}
                        />
                        <Bar dataKey="high" stackId="a" fill="var(--color-high)" radius={[0, 0, 4, 4]} hide={hiddenSeries.includes('high')} />
                        <Bar dataKey="low" stackId="a" fill="var(--color-low)" radius={[4, 4, 0, 0]} hide={hiddenSeries.includes('low')} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
