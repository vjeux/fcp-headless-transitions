__ZN29FFLoudnessAnalyzerInputReader10pullFramesEyP15AudioBufferListPb:
0000000000539170	pushq	%rbp
0000000000539171	movq	%rsp, %rbp
0000000000539174	pushq	%r15
0000000000539176	pushq	%r14
0000000000539178	pushq	%r13
000000000053917a	pushq	%r12
000000000053917c	pushq	%rbx
000000000053917d	subq	$0x38, %rsp
0000000000539181	movq	%rcx, %rbx
0000000000539184	movq	%rsi, %r14
0000000000539187	movq	0x30(%rdi), %rsi
000000000053918b	cmpq	0x38(%rdi), %rsi
000000000053918f	jae	0x5391dc
0000000000539191	movq	(%rdi), %r15
0000000000539194	cvttsd2si	0x8(%rdi), %eax
0000000000539199	leaq	-0x40(%rbp), %rcx
000000000053919d	movq	%rdi, %r13
00000000005391a0	movq	%rcx, %rdi
00000000005391a3	movq	%rdx, %r12
00000000005391a6	movl	%eax, %edx
00000000005391a8	callq	0x1495136                       ## symbol stub for: _CMTimeMake
00000000005391ad	movq	0x1697bfc(%rip), %rsi
00000000005391b4	movq	-0x30(%rbp), %rax
00000000005391b8	movq	%rax, 0x10(%rsp)
00000000005391bd	movups	-0x40(%rbp), %xmm0
00000000005391c1	movups	%xmm0, (%rsp)
00000000005391c5	movq	%r15, %rdi
00000000005391c8	movq	%r12, %rdx
00000000005391cb	movl	%r14d, %ecx
00000000005391ce	callq	*0x13b44ec(%rip)                ## Objc message: -[%rdi observer]
00000000005391d4	addq	%r14, 0x30(%r13)
00000000005391d8	xorl	%eax, %eax
00000000005391da	jmp	0x5391ec
00000000005391dc	movq	%rdx, %rdi
00000000005391df	xorl	%esi, %esi
00000000005391e1	xorl	%edx, %edx
00000000005391e3	xorl	%ecx, %ecx
00000000005391e5	callq	__Z19zeroAudioBufferListP15AudioBufferListj36FFAudioBufferList_ZeroNumBytesOptionj ## zeroAudioBufferList(AudioBufferList*, unsigned int, FFAudioBufferList_ZeroNumBytesOption, unsigned int)
00000000005391ea	movb	$0x1, %al
00000000005391ec	movb	%al, (%rbx)
00000000005391ee	addq	$0x38, %rsp
00000000005391f2	popq	%rbx
00000000005391f3	popq	%r12
00000000005391f5	popq	%r13
00000000005391f7	popq	%r14
00000000005391f9	popq	%r15
00000000005391fb	popq	%rbp
00000000005391fc	retq
00000000005391fd	nopl	(%rax)
