__ZN10HGCropNode15RenderPageMetalEP6HGPage:
0000000000247880	pushq	%rbp
0000000000247881	movq	%rsp, %rbp
0000000000247884	pushq	%r15
0000000000247886	pushq	%r14
0000000000247888	pushq	%r12
000000000024788a	pushq	%rbx
000000000024788b	subq	$0x10, %rsp
000000000024788f	movq	%rsi, %rbx
0000000000247892	movq	%rdi, %r14
0000000000247895	movq	(%rdi), %rax
0000000000247898	movl	$0x17, %esi
000000000024789d	xorl	%edx, %edx
000000000024789f	callq	*0xa8(%rax)
00000000002478a5	movl	%eax, %r15d
00000000002478a8	leaq	-0x28(%rbp), %rdi
00000000002478ac	movq	%r14, %rsi
00000000002478af	movq	%rbx, %rdx
00000000002478b2	callq	__ZN28HGPagePullMetalTexturesGuardC1EP6HGNodeP6HGPage ## HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*)
00000000002478b7	movq	0xa8(%rbx), %rax
00000000002478be	testq	%rax, %rax
00000000002478c1	je	0x247918
00000000002478c3	movl	0x10(%r14), %r12d
00000000002478c7	movq	0x14(%rax), %rdi
00000000002478cb	movq	0x1c(%rax), %rsi
00000000002478cf	movq	0x10(%rbx), %rdx
00000000002478d3	movq	0x18(%rbx), %rcx
00000000002478d7	callq	_HGRectIsEqual
00000000002478dc	testl	%eax, %eax
00000000002478de	je	0x247918
00000000002478e0	testl	$0x1000, %r12d                  ## imm = 0x1000
00000000002478e7	je	0x2478f6
00000000002478e9	movq	0xa8(%rbx), %rax
00000000002478f0	testb	$0x1, 0xc(%rax)
00000000002478f4	je	0x247918
00000000002478f6	cmpq	$0x0, 0x8(%rbx)
00000000002478fb	jne	0x247918
00000000002478fd	testl	%r15d, %r15d
0000000000247900	jne	0x247918
0000000000247902	movq	0xa8(%rbx), %rdi
0000000000247909	movq	(%rdi), %rax
000000000024790c	callq	*0x10(%rax)
000000000024790f	movq	0xa8(%rbx), %rbx
0000000000247916	jmp	0x247926
0000000000247918	movq	%r14, %rdi
000000000024791b	movq	%rbx, %rsi
000000000024791e	callq	__ZN6HGNode15RenderPageMetalEP6HGPage ## HGNode::RenderPageMetal(HGPage*)
0000000000247923	movq	%rax, %rbx
0000000000247926	leaq	-0x28(%rbp), %rdi
000000000024792a	callq	__ZN28HGPagePullMetalTexturesGuardD1Ev ## HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()
000000000024792f	movq	%rbx, %rax
0000000000247932	addq	$0x10, %rsp
0000000000247936	popq	%rbx
0000000000247937	popq	%r12
0000000000247939	popq	%r14
000000000024793b	popq	%r15
000000000024793d	popq	%rbp
000000000024793e	retq
000000000024793f	movq	%rax, %rbx
0000000000247942	leaq	-0x28(%rbp), %rdi
0000000000247946	callq	__ZN28HGPagePullMetalTexturesGuardD1Ev ## HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()
000000000024794b	movq	%rbx, %rdi
000000000024794e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000247953	nopw	%cs:(%rax,%rax)
