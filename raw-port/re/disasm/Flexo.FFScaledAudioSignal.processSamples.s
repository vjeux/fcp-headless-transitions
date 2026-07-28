__ZNK19FFScaledAudioSignal14processSamplesEPfyy:
0000000001258df0	pushq	%rbp
0000000001258df1	movq	%rsp, %rbp
0000000001258df4	pushq	%r15
0000000001258df6	pushq	%r14
0000000001258df8	pushq	%rbx
0000000001258df9	pushq	%rax
0000000001258dfa	movq	%rcx, %rbx
0000000001258dfd	movq	%rsi, %r14
0000000001258e00	movq	%rdi, %r15
0000000001258e03	movq	0x20(%rdi), %rdi
0000000001258e07	movq	(%rdi), %rax
0000000001258e0a	callq	*0x20(%rax)
0000000001258e0d	movsd	0x28(%r15), %xmm0
0000000001258e13	cvtsd2ss	%xmm0, %xmm0
0000000001258e17	leaq	__ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip), %rax ## MixerVectorFunctions::sMixerVectorFunctions
0000000001258e1e	movq	(%rax), %rax
0000000001258e21	movq	(%rax), %rax
0000000001258e24	movq	%r14, %rdi
0000000001258e27	movl	%ebx, %esi
0000000001258e29	addq	$0x8, %rsp
0000000001258e2d	popq	%rbx
0000000001258e2e	popq	%r14
0000000001258e30	popq	%r15
0000000001258e32	popq	%rbp
0000000001258e33	jmpq	*%rax
0000000001258e35	nopw	%cs:(%rax,%rax)
