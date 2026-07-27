__ZN10PCCurveFit21NewtonRaphsonRootFindERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEERS3_d:
000000000000c508	pushq	%rbp
000000000000c509	movq	%rsp, %rbp
000000000000c50c	pushq	%r15
000000000000c50e	pushq	%r14
000000000000c510	pushq	%r13
000000000000c512	pushq	%r12
000000000000c514	pushq	%rbx
000000000000c515	subq	$0xa8, %rsp
000000000000c51c	movq	%rdx, %rbx
000000000000c51f	movq	%rsi, %r14
000000000000c522	xorpd	%xmm1, %xmm1
000000000000c526	movapd	%xmm1, -0x60(%rbp)
000000000000c52b	xorl	%eax, %eax
000000000000c52d	movq	%rax, -0x50(%rbp)
000000000000c531	movq	%rax, -0x70(%rbp)
000000000000c535	movapd	%xmm1, -0x80(%rbp)
000000000000c53a	leaq	-0x40(%rbp), %rdi
000000000000c53e	movl	$0x3, %edx
000000000000c543	movq	%rsi, %rcx
000000000000c546	movsd	%xmm0, -0x68(%rbp)
000000000000c54b	callq	__ZN10PCCurveFit6BezierEiRNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEd ## PCCurveFit::Bezier(int, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, double)
000000000000c550	leaq	-0x40(%rbp), %r15
000000000000c554	movapd	(%r15), %xmm0
000000000000c559	movapd	%xmm0, -0xd0(%rbp)
000000000000c561	xorl	%r13d, %r13d
000000000000c564	leaq	-0x60(%rbp), %r12
000000000000c568	xorl	%ecx, %ecx
000000000000c56a	xorl	%eax, %eax
000000000000c56c	xorpd	%xmm0, %xmm0
000000000000c570	movapd	%xmm0, -0x40(%rbp)
000000000000c575	cmpq	-0x50(%rbp), %rax
000000000000c579	jae	0xc585
000000000000c57b	movupd	%xmm0, (%rax)
000000000000c57f	addq	$0x10, %rax
000000000000c583	jmp	0xc594
000000000000c585	movq	%r12, %rdi
000000000000c588	movq	%r15, %rsi
000000000000c58b	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c590	movq	-0x60(%rbp), %rcx
000000000000c594	movq	%rax, -0x58(%rbp)
000000000000c598	movq	(%r14), %rdx
000000000000c59b	movupd	(%r13,%rdx), %xmm0
000000000000c5a2	movupd	0x10(%r13,%rdx), %xmm1
000000000000c5a9	subpd	%xmm0, %xmm1
000000000000c5ad	mulpd	0x11629b(%rip), %xmm1
000000000000c5b5	movupd	%xmm1, (%rcx,%r13)
000000000000c5bb	addq	$0x10, %r13
000000000000c5bf	cmpq	$0x30, %r13
000000000000c5c3	jne	0xc56c
000000000000c5c5	movb	$0x1, %r12b
000000000000c5c8	xorl	%edx, %edx
000000000000c5ca	leaq	-0x80(%rbp), %r14
000000000000c5ce	leaq	-0x40(%rbp), %r15
000000000000c5d2	xorl	%eax, %eax
000000000000c5d4	xorl	%r13d, %r13d
000000000000c5d7	xorpd	%xmm0, %xmm0
000000000000c5db	movapd	%xmm0, -0x40(%rbp)
000000000000c5e0	cmpq	-0x70(%rbp), %rax
000000000000c5e4	jae	0xc5f0
000000000000c5e6	movupd	%xmm0, (%rax)
000000000000c5ea	addq	$0x10, %rax
000000000000c5ee	jmp	0xc603
000000000000c5f0	movq	%r14, %rdi
000000000000c5f3	movq	%r15, %rsi
000000000000c5f6	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000c5fb	movq	-0x80(%rbp), %rdx
000000000000c5ff	movq	-0x60(%rbp), %rcx
000000000000c603	movq	%rax, -0x78(%rbp)
000000000000c607	shlq	$0x4, %r13
000000000000c60b	movupd	(%rcx,%r13), %xmm0
000000000000c611	movupd	0x10(%rcx,%r13), %xmm1
000000000000c618	subpd	%xmm0, %xmm1
000000000000c61c	addpd	%xmm1, %xmm1
000000000000c620	movupd	%xmm1, (%rdx,%r13)
000000000000c626	movl	$0x1, %r13d
000000000000c62c	testb	$0x1, %r12b
000000000000c630	movl	$0x0, %r12d
000000000000c636	jne	0xc5d7
000000000000c638	leaq	-0x40(%rbp), %rdi
000000000000c63c	leaq	-0x60(%rbp), %rcx
000000000000c640	movl	$0x2, %edx
000000000000c645	movsd	-0x68(%rbp), %xmm0
000000000000c64a	callq	__ZN10PCCurveFit6BezierEiRNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEd ## PCCurveFit::Bezier(int, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, double)
000000000000c64f	leaq	-0x40(%rbp), %rdi
000000000000c653	movaps	(%rdi), %xmm0
000000000000c656	movaps	%xmm0, -0xc0(%rbp)
000000000000c65d	leaq	-0x80(%rbp), %rcx
000000000000c661	movl	$0x1, %edx
000000000000c666	movsd	-0x68(%rbp), %xmm0
000000000000c66b	callq	__ZN10PCCurveFit6BezierEiRNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEd ## PCCurveFit::Bezier(int, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, double)
000000000000c670	movsd	-0x40(%rbp), %xmm0
000000000000c675	movaps	%xmm0, -0xa0(%rbp)
000000000000c67c	movsd	-0x38(%rbp), %xmm0
000000000000c681	movaps	%xmm0, -0xb0(%rbp)
000000000000c688	movups	(%rbx), %xmm0
000000000000c68b	movaps	%xmm0, -0x90(%rbp)
000000000000c692	movq	-0x80(%rbp), %rdi
000000000000c696	testq	%rdi, %rdi
000000000000c699	je	0xc6a4
000000000000c69b	movq	%rdi, -0x78(%rbp)
000000000000c69f	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c6a4	movq	-0x60(%rbp), %rdi
000000000000c6a8	testq	%rdi, %rdi
000000000000c6ab	je	0xc6b6
000000000000c6ad	movq	%rdi, -0x58(%rbp)
000000000000c6b1	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c6b6	movapd	-0xd0(%rbp), %xmm2
000000000000c6be	subpd	-0x90(%rbp), %xmm2
000000000000c6c6	movapd	-0xc0(%rbp), %xmm3
000000000000c6ce	movapd	%xmm3, %xmm0
000000000000c6d2	movapd	%xmm3, %xmm1
000000000000c6d6	mulpd	%xmm3, %xmm1
000000000000c6da	haddpd	%xmm1, %xmm1
000000000000c6de	mulpd	%xmm2, %xmm0
000000000000c6e2	movapd	-0xa0(%rbp), %xmm4
000000000000c6ea	mulsd	%xmm2, %xmm4
000000000000c6ee	addsd	%xmm1, %xmm4
000000000000c6f2	shufpd	$0x1, %xmm4, %xmm0              ## xmm0 = xmm0[1],xmm4[0]
000000000000c6f7	unpcklpd	-0xb0(%rbp), %xmm3              ## xmm3 = xmm3[0],mem[0]
000000000000c6ff	mulpd	%xmm2, %xmm3
000000000000c703	addpd	%xmm0, %xmm3
000000000000c707	movapd	%xmm3, %xmm0
000000000000c70b	unpckhpd	%xmm3, %xmm0                    ## xmm0 = xmm0[1],xmm3[1]
000000000000c70f	divsd	%xmm0, %xmm3
000000000000c713	movsd	-0x68(%rbp), %xmm0
000000000000c718	subsd	%xmm3, %xmm0
000000000000c71c	addq	$0xa8, %rsp
000000000000c723	popq	%rbx
000000000000c724	popq	%r12
000000000000c726	popq	%r13
000000000000c728	popq	%r14
000000000000c72a	popq	%r15
000000000000c72c	popq	%rbp
000000000000c72d	retq
000000000000c72e	jmp	0xc736
000000000000c730	jmp	0xc736
000000000000c732	jmp	0xc736
000000000000c734	jmp	0xc736
000000000000c736	movq	%rax, %rbx
000000000000c739	movq	-0x80(%rbp), %rdi
000000000000c73d	testq	%rdi, %rdi
000000000000c740	je	0xc74b
000000000000c742	movq	%rdi, -0x78(%rbp)
000000000000c746	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c74b	movq	-0x60(%rbp), %rdi
000000000000c74f	testq	%rdi, %rdi
000000000000c752	je	0xc75d
000000000000c754	movq	%rdi, -0x58(%rbp)
000000000000c758	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c75d	movq	%rbx, %rdi
000000000000c760	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
000000000000c765	nop
