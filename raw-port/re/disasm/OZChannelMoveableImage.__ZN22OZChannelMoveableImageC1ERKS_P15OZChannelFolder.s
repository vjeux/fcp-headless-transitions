__ZN22OZChannelMoveableImageC1ERKS_P15OZChannelFolder:
0000000000339820	pushq	%rbp
0000000000339821	movq	%rsp, %rbp
0000000000339824	pushq	%r14
0000000000339826	pushq	%rbx
0000000000339827	movq	%rsi, %r14
000000000033982a	movq	%rdi, %rbx
000000000033982d	callq	__ZN25OZChanElementOrFootageRefC2ERK18OZChanSceneNodeRefP15OZChannelFolder ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZChanSceneNodeRef const&, OZChannelFolder*)
0000000000339832	leaq	0x5163b7(%rip), %rax
0000000000339839	movq	%rax, (%rbx)
000000000033983c	leaq	0x51672d(%rip), %rax
0000000000339843	movq	%rax, 0x10(%rbx)
0000000000339847	movq	0xa0(%r14), %rdi
000000000033984e	testq	%rdi, %rdi
0000000000339851	je	0x339860
0000000000339853	movq	(%rdi), %rax
0000000000339856	callq	*0xf8(%rax)
000000000033985c	movb	$0x1, %cl
000000000033985e	jmp	0x339864
0000000000339860	xorl	%eax, %eax
0000000000339862	xorl	%ecx, %ecx
0000000000339864	movq	%rax, 0xa0(%rbx)
000000000033986b	movb	%cl, 0xa8(%rbx)
0000000000339871	popq	%rbx
0000000000339872	popq	%r14
0000000000339874	popq	%rbp
0000000000339875	retq
0000000000339876	movq	%rax, %r14
0000000000339879	movq	%rbx, %rdi
000000000033987c	callq	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339881	movq	%r14, %rdi
0000000000339884	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000339889	nopl	(%rax)
