import { ModelVersion } from '@shared/models/model-version.model';
import { ISignature } from '@shared/models/signature.model';

export interface IKafkaStreaming {
    sourceTopic: string;
    destinationTopic: string;
    consumerId?: string;
    errorTopic?: string;
}

export enum TestStatus {
    Failed = 'failed',
    Pending = 'pending',
    Success = 'success',
    Undefined = '',
}

export enum ApplicationStatus {
    Assembling = 'assembling',
    Ready = 'ready',
    Failed = 'failed',
    Undefined = 'undefined',
}

export interface Stage {
    modelVariants: IModelVariant[];
    signature: string;
}

export interface IModelVariant {
    modelVersion: ModelVersion;
    weight: number;
    signature: ISignature;
}

export interface IExecutionGraph {
    stages: Stage[];
}

export interface IApplication {
    id?: number;
    signature?: ISignature;
    name: string;
    executionGraph: IExecutionGraph;
    kafkaStreaming?: IKafkaStreaming[];
    input: string;
    output: string;
    namespace?: string;
    testStatus?: TestStatus;
    status: string;
    error?: string;
    message?: string;
}

export class Application implements IApplication {
    id?: number;
    signature?: ISignature;
    name: string;
    executionGraph: IExecutionGraph;
    namespace?: string;
    kafkaStreaming?: IKafkaStreaming[];
    input: string;
    output: string;
    testStatus?: TestStatus;
    error?: string;
    status: string;
    message?: string;

    constructor(props: any = {}) {
        if (props.id) { this.id = props.id; }
        if (props.signature) { this.signature = props.signature; }
        this.name = props.name;
        this.executionGraph = props.executionGraph;
        this.kafkaStreaming = props.kafkaStreaming;
        this.input = props.input || null;
        this.output = props.output || null;
        this.namespace = props.namespace || null;
        this.testStatus = props.testStatus || null;
        this.error = props.error || '';
        this.testStatus = props.testStatus || TestStatus.Undefined;
        this.status = props.status;
        this.message = props.message;
    }
}
