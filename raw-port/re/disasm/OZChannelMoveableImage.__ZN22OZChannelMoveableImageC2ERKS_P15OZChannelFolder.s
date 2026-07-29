__ZN22OZChannelMoveableImageC2ERKS_P15OZChannelFolder:
00000000003397b0	pushq	%rbp
00000000003397b1	movq	%rsp, %rbp
00000000003397b4	pushq	%r14
00000000003397b6	pushq	%rbx
00000000003397b7	movq	%rsi, %r14
00000000003397ba	movq	%rdi, %rbx
00000000003397bd	callq	__ZN25OZChanElementOrFootageRefC2ERK18OZChanSceneNodeRefP15OZChannelFolder ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZChanSceneNodeRef const&, OZChannelFolder*)
00000000003397c2	leaq	0x516427(%rip), %rax
00000000003397c9	movq	%rax, (%rbx)
00000000003397cc	leaq	0x51679d(%rip), %rax
00000000003397d3	movq	%rax, 0x10(%rbx)
00000000003397d7	movq	0xa0(%r14), %rdi
00000000003397de	testq	%rdi, %rdi
00000000003397e1	je	0x3397f0
00000000003397e3	movq	(%rdi), %rax
00000000003397e6	callq	*0xf8(%rax)
00000000003397ec	movb	$0x1, %cl
00000000003397ee	jmp	0x3397f4
00000000003397f0	xorl	%eax, %eax
00000000003397f2	xorl	%ecx, %ecx
00000000003397f4	movq	%rax, 0xa0(%rbx)
00000000003397fb	movb	%cl, 0xa8(%rbx)
0000000000339801	popq	%rbx
0000000000339802	popq	%r14
0000000000339804	popq	%rbp
0000000000339805	retq
0000000000339806	movq	%rax, %r14
0000000000339809	movq	%rbx, %rdi
000000000033980c	callq	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339811	movq	%r14, %rdi
0000000000339814	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000339819	nopl	(%rax)
