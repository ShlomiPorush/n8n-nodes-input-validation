import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { applyDefaultsToJson } from '../../utils/applyDefaults';
import { evaluateRuleGroups } from '../../utils/evaluateRuleGroups';
import { formatValidationError } from '../../utils/formatValidationError';
import { parseRuleGroups } from '../../utils/parseRuleGroups';
import type { Combinator } from '../../utils/types';

export class InputValidation implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Input Validation',
		name: 'inputValidation',
		icon: 'file:inputValidation.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["groupsCombinator"]}} groups',
		description: 'Validate incoming data and route to Valid or Invalid outputs',
		defaults: {
			name: 'Input Validation',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main, NodeConnectionTypes.Main],
		outputNames: ['Valid', 'Invalid'],
		properties: [
			{
				displayName: 'Combine Groups',
				name: 'groupsCombinator',
				type: 'options',
				options: [
					{ name: 'AND', value: 'and' },
					{ name: 'OR', value: 'or' },
				],
				default: 'and',
				description:
					'How to combine rule groups. AND = all groups must pass. OR = at least one group must pass.',
			},
			{
				displayName: 'Rule Groups',
				name: 'ruleGroups',
				placeholder: 'Add Rule Group',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				options: [
					{
						name: 'group',
						displayName: 'Group',
						values: [
							{
								displayName: 'Combine Conditions',
								name: 'groupCombinator',
								type: 'options',
								options: [
									{ name: 'AND', value: 'and' },
									{ name: 'OR', value: 'or' },
								],
								default: 'and',
								description:
									'AND = all conditions in this group must pass. OR = at least one condition must pass.',
							},
							{
								displayName: 'Conditions',
								name: 'conditions',
								placeholder: 'Add Condition',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
									sortable: true,
								},
								default: {},
								options: [
									{
										name: 'condition',
										displayName: 'Condition',
										values: [
											{
												displayName: 'Field',
												name: 'field',
												type: 'string',
												default: '',
												placeholder: 'body.email',
												description:
													'Dot-notation path on the incoming JSON (e.g. body.email, query.page, headers.authorization)',
												required: true,
											},
											{
												displayName: 'Operation',
												name: 'operation',
												type: 'options',
												options: [
													{ name: 'Is Empty', value: 'isEmpty' },
													{ name: 'Is Not Empty', value: 'isNotEmpty' },
													{ name: 'Contains', value: 'contains' },
													{ name: 'Does Not Contain', value: 'notContains' },
													{ name: 'Equals', value: 'equals' },
													{ name: 'Does Not Equal', value: 'notEquals' },
													{ name: 'Greater Than', value: 'greaterThan' },
													{ name: 'Less Than', value: 'lessThan' },
													{ name: 'Is True', value: 'isTrue' },
													{ name: 'Is False', value: 'isFalse' },
													{ name: 'Is Boolean', value: 'isBoolean' },
												],
												default: 'isNotEmpty',
												required: true,
											},
											{
												displayName: 'Value',
												name: 'value',
												type: 'string',
												default: '',
												displayOptions: {
													hide: {
														operation: [
															'isEmpty',
															'isNotEmpty',
															'isTrue',
															'isFalse',
															'isBoolean',
														],
													},
												},
											},
											{
												displayName: 'Default Value',
												name: 'defaultValue',
												type: 'string',
												default: '',
												placeholder: 'e.g. false',
												description:
													'When the field is missing: skip this condition and add this value to the Valid output. For booleans use true or false.',
											},
											{
												displayName: 'Error Message',
												name: 'errorMessage',
												type: 'string',
												default: '',
												description: 'Optional custom message when this condition fails',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Ignore Case',
						name: 'ignoreCase',
						type: 'boolean',
						default: true,
						description:
							'Whether to ignore letter case for contains, equals, and not equals comparisons',
					},
					{
						displayName: 'Error Status Code',
						name: 'statusCode',
						type: 'number',
						default: 400,
						description: 'HTTP status code included in the Invalid output',
					},
					{
						displayName: 'Include Original Input',
						name: 'includeOriginal',
						type: 'boolean',
						default: false,
						description:
							'Whether to include the original input JSON in the Invalid output under "original"',
					},
					{
						displayName: 'Error Message',
						name: 'message',
						type: 'string',
						default: 'Validation failed',
						description: 'Summary message included in the Invalid output',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const validItems: INodeExecutionData[] = [];
		const invalidItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const groupsCombinator = this.getNodeParameter(
					'groupsCombinator',
					itemIndex,
				) as Combinator;
				const ruleGroupsRaw = this.getNodeParameter('ruleGroups', itemIndex) as IDataObject;
				const options = this.getNodeParameter('options', itemIndex, {}) as {
					ignoreCase?: boolean;
					statusCode?: number;
					includeOriginal?: boolean;
					message?: string;
				};

				const groups = parseRuleGroups(ruleGroupsRaw as Parameters<typeof parseRuleGroups>[0]);
				const data = item.json as Record<string, unknown>;

				const { errors, defaults } = evaluateRuleGroups(groups, groupsCombinator, data, {
					ignoreCase: options.ignoreCase ?? true,
				});

				if (errors.length === 0) {
					if (item.pairedItem === undefined) {
						item.pairedItem = { item: itemIndex };
					}
					validItems.push({
						...item,
						json: applyDefaultsToJson(data, defaults),
					});
					continue;
				}

				const invalidJson: IDataObject = {
					valid: false,
					statusCode: options.statusCode ?? 400,
					message: options.message ?? 'Validation failed',
					error: formatValidationError(errors),
					errors,
				};

				if (options.includeOriginal) {
					invalidJson.original = item.json;
				}

				invalidItems.push({
					json: invalidJson,
					pairedItem: item.pairedItem ?? { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const errorText =
						error instanceof Error ? error.message : 'Unknown error';
					invalidItems.push({
						json: {
							valid: false,
							statusCode: 500,
							message: errorText,
							error: errorText,
							errors: [],
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}

		return [validItems, invalidItems];
	}
}
