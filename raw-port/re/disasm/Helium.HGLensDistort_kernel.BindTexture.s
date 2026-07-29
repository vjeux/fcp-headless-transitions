__ZN20HGLensDistort_kernel11BindTextureEP9HGHandleri:
000000000022a6e0	pushq	%rbp
000000000022a6e1	movq	%rsp, %rbp
000000000022a6e4	pushq	%r14
000000000022a6e6	pushq	%rbx
000000000022a6e7	movl	%edx, %r14d
000000000022a6ea	movq	%rsi, %rbx
000000000022a6ed	movq	0x90(%rsi), %rdi
000000000022a6f4	movl	$0x60000, %esi                  ## imm = 0x60000
000000000022a6f9	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000022a6fe	movl	$0xffffffff, %ecx               ## imm = 0xFFFFFFFF
000000000022a703	testl	%r14d, %r14d
000000000022a706	jne	0x22a76c
000000000022a708	cmpl	$__ZN13HGRenderUtils17BufferReformatterD2Ev, %eax ## HGRenderUtils::BufferReformatter::~BufferReformatter()
000000000022a70d	setae	%cl
000000000022a710	addl	$0xfff9fce0, %eax               ## imm = 0xFFF9FCE0
000000000022a715	cmpl	$0xf0, %eax
000000000022a71a	setb	%al
000000000022a71d	orb	%cl, %al
000000000022a71f	cmpb	$0x1, %al
000000000022a721	jne	0x22a743
000000000022a723	movq	(%rbx), %rax
000000000022a726	movq	%rbx, %rdi
000000000022a729	xorl	%esi, %esi
000000000022a72b	xorl	%edx, %edx
000000000022a72d	callq	*0x48(%rax)
000000000022a730	movq	(%rbx), %rax
000000000022a733	movq	%rbx, %rdi
000000000022a736	movl	$0x1, %esi
000000000022a73b	movl	$0x1, %edx
000000000022a740	callq	*0x30(%rax)
000000000022a743	cvtsi2ssl	0xf0(%rbx), %xmm0
000000000022a74b	cvtsi2ssl	0xf4(%rbx), %xmm1
000000000022a753	movq	(%rbx), %rax
000000000022a756	xorps	%xmm2, %xmm2
000000000022a759	xorps	%xmm3, %xmm3
000000000022a75c	movq	%rbx, %rdi
000000000022a75f	movl	$0x4, %esi
000000000022a764	callq	*0x88(%rax)
000000000022a76a	xorl	%ecx, %ecx
000000000022a76c	movl	%ecx, %eax
000000000022a76e	popq	%rbx
000000000022a76f	popq	%r14
000000000022a771	popq	%rbp
000000000022a772	retq
000000000022a773	nopw	%cs:(%rax,%rax)
