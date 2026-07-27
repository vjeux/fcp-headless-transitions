__ZN9OZChannel12parseElementER22PCSerializerReadStreamR15PCStreamElement:
000000000001516e	pushq	%rbp
000000000001516f	movq	%rsp, %rbp
0000000000015172	pushq	%r15
0000000000015174	pushq	%r14
0000000000015176	pushq	%rbx
0000000000015177	subq	$0x18, %rsp
000000000001517b	movq	%rdx, %r14
000000000001517e	movq	%rsi, %r15
0000000000015181	movq	%rdi, %rbx
0000000000015184	callq	__ZN13OZChannelBase12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZChannelBase::parseElement(PCSerializerReadStream&, PCStreamElement&)
0000000000015189	movl	0x8(%r14), %eax
000000000001518d	cmpl	$0x77, %eax
0000000000015190	jle	0x151db
0000000000015192	cmpl	$0x78, %eax
0000000000015195	je	0x1520b
0000000000015197	cmpl	$0x82, %eax
000000000001519c	je	0x1522a
00000000000151a2	cmpl	$0x83, %eax
00000000000151a7	jne	0x1528b
00000000000151ad	movq	(%r14), %rax
00000000000151b0	leaq	-0x30(%rbp), %r15
00000000000151b4	movq	%r14, %rdi
00000000000151b7	movq	%r15, %rsi
00000000000151ba	callq	*0x20(%rax)
00000000000151bd	movl	(%r15), %esi
00000000000151c0	cmpl	$0x4, %esi
00000000000151c3	jb	0x151ce
00000000000151c5	movl	$0x0, -0x30(%rbp)
00000000000151cc	xorl	%esi, %esi
00000000000151ce	movq	%rbx, %rdi
00000000000151d1	callq	__ZN9OZChannel15setFadeOutCurveEj ## OZChannel::setFadeOutCurve(unsigned int)
00000000000151d6	jmp	0x1528b
00000000000151db	cmpl	$0x76, %eax
00000000000151de	je	0x15255
00000000000151e0	cmpl	$0x77, %eax
00000000000151e3	jne	0x1528b
00000000000151e9	movq	(%r14), %rax
00000000000151ec	leaq	-0x30(%rbp), %r15
00000000000151f0	movq	%r14, %rdi
00000000000151f3	movq	%r15, %rsi
00000000000151f6	callq	*0x58(%rax)
00000000000151f9	movq	%rbx, %rdi
00000000000151fc	movq	%r15, %rsi
00000000000151ff	xorl	%edx, %edx
0000000000015201	callq	__ZN9OZChannel15setFadeInOffsetERK6CMTimeb ## OZChannel::setFadeInOffset(CMTime const&, bool)
0000000000015206	jmp	0x1528b
000000000001520b	movq	(%r14), %rax
000000000001520e	leaq	-0x30(%rbp), %r15
0000000000015212	movq	%r14, %rdi
0000000000015215	movq	%r15, %rsi
0000000000015218	callq	*0x58(%rax)
000000000001521b	movq	%rbx, %rdi
000000000001521e	movq	%r15, %rsi
0000000000015221	xorl	%edx, %edx
0000000000015223	callq	__ZN9OZChannel16setFadeOutOffsetERK6CMTimeb ## OZChannel::setFadeOutOffset(CMTime const&, bool)
0000000000015228	jmp	0x1528b
000000000001522a	movq	(%r14), %rax
000000000001522d	leaq	-0x30(%rbp), %r15
0000000000015231	movq	%r14, %rdi
0000000000015234	movq	%r15, %rsi
0000000000015237	callq	*0x20(%rax)
000000000001523a	movl	(%r15), %esi
000000000001523d	cmpl	$0x4, %esi
0000000000015240	jb	0x1524b
0000000000015242	movl	$0x0, -0x30(%rbp)
0000000000015249	xorl	%esi, %esi
000000000001524b	movq	%rbx, %rdi
000000000001524e	callq	__ZN9OZChannel14setFadeInCurveEj ## OZChannel::setFadeInCurve(unsigned int)
0000000000015253	jmp	0x1528b
0000000000015255	movq	0x70(%rbx), %rax
0000000000015259	cmpb	$0x1, 0x20(%rax)
000000000001525d	jne	0x1526b
000000000001525f	movq	%rax, %rdi
0000000000015262	callq	__ZN13OZChannelImpl15createLocalCopyEv ## OZChannelImpl::createLocalCopy()
0000000000015267	movq	%rax, 0x70(%rbx)
000000000001526b	movq	0x8(%rax), %rsi
000000000001526f	movq	%r15, %rdi
0000000000015272	callq	0xacc42                         ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
0000000000015277	movq	0x70(%rbx), %rax
000000000001527b	movq	0x8(%rax), %rdi
000000000001527f	movq	(%rdi), %rax
0000000000015282	movq	%r15, %rsi
0000000000015285	movq	%r14, %rdx
0000000000015288	callq	*0x38(%rax)
000000000001528b	movb	$0x1, %al
000000000001528d	addq	$0x18, %rsp
0000000000015291	popq	%rbx
0000000000015292	popq	%r14
0000000000015294	popq	%r15
0000000000015296	popq	%rbp
0000000000015297	retq
