__ZNK13HgcApply1DLUT21InitProgramDescriptorEP19HGProgramDescriptor:
0000000000025220	pushq	%rbp
0000000000025221	movq	%rsp, %rbp
0000000000025224	xorps	%xmm0, %xmm0
0000000000025227	xorl	%eax, %eax
0000000000025229	ucomiss	0x1cc(%rdi), %xmm0
0000000000025230	seta	%al
0000000000025233	movzbl	0x1e0(%rdi), %edx
000000000002523a	movq	%rsi, %rdi
000000000002523d	movl	%eax, %esi
000000000002523f	popq	%rbp
0000000000025240	jmp	__Z28InitApply1DProgramDescriptorP19HGProgramDescriptorbb ## InitApply1DProgramDescriptor(HGProgramDescriptor*, bool, bool)
0000000000025245	nopw	%cs:(%rax,%rax)
