__ZN22OZChannelMoveableImageD1Ev:
00000000003398f0	leaq	0x5162f9(%rip), %rax
00000000003398f7	movq	%rax, (%rdi)
00000000003398fa	leaq	0x51666f(%rip), %rax
0000000000339901	movq	%rax, 0x10(%rdi)
0000000000339905	cmpb	$0x1, 0xa8(%rdi)
000000000033990c	jne	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339912	movq	0xa0(%rdi), %rax
0000000000339919	testq	%rax, %rax
000000000033991c	je	0x339939
000000000033991e	pushq	%rbp
000000000033991f	movq	%rsp, %rbp
0000000000339922	pushq	%rbx
0000000000339923	pushq	%rax
0000000000339924	movq	(%rax), %rcx
0000000000339927	movq	%rdi, %rbx
000000000033992a	movq	%rax, %rdi
000000000033992d	callq	*0x8(%rcx)
0000000000339930	movq	%rbx, %rdi
0000000000339933	addq	$0x8, %rsp
0000000000339937	popq	%rbx
0000000000339938	popq	%rbp
0000000000339939	movq	$0x0, 0xa0(%rdi)
0000000000339944	jmp	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339949	nopl	(%rax)
