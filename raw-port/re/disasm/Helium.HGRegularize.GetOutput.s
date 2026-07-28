__ZN12HGRegularize9GetOutputEP10HGRenderer:
00000000001c35f0	movq	%rdi, %rax
00000000001c35f3	movss	0x1a8(%rdi), %xmm0
00000000001c35fb	xorps	%xmm1, %xmm1
00000000001c35fe	ucomiss	%xmm0, %xmm1
00000000001c3601	jae	0x1c365f
00000000001c3603	pushq	%rbp
00000000001c3604	movq	%rsp, %rbp
00000000001c3607	pushq	%r15
00000000001c3609	pushq	%r14
00000000001c360b	pushq	%rbx
00000000001c360c	pushq	%rax
00000000001c360d	ucomiss	0x69a69c(%rip), %xmm0
00000000001c3614	cvttss2si	%xmm0, %ecx
00000000001c3618	movslq	%ecx, %rcx
00000000001c361b	movl	$0xc8, %r14d
00000000001c3621	cmovbeq	%rcx, %r14
00000000001c3625	movq	0x198(%rax), %rbx
00000000001c362c	movq	%rsi, %rdi
00000000001c362f	movq	%rax, %rsi
00000000001c3632	xorl	%edx, %edx
00000000001c3634	movq	%rax, %r15
00000000001c3637	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001c363c	movq	(%rbx), %rcx
00000000001c363f	movq	%rbx, %rdi
00000000001c3642	xorl	%esi, %esi
00000000001c3644	movq	%rax, %rdx
00000000001c3647	callq	*0x78(%rcx)
00000000001c364a	movq	0x1a0(%r15), %rax
00000000001c3651	movq	(%rax,%r14,8), %rax
00000000001c3655	addq	$0x8, %rsp
00000000001c3659	popq	%rbx
00000000001c365a	popq	%r14
00000000001c365c	popq	%r15
00000000001c365e	popq	%rbp
00000000001c365f	retq
