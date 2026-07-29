__ZN17OZImageMaskRender24getStencilWrapPixelXFormER7LiAgent:
000000000046f4e0	pushq	%rbp
000000000046f4e1	movq	%rsp, %rbp
000000000046f4e4	pushq	%r15
000000000046f4e6	pushq	%r14
000000000046f4e8	pushq	%r12
000000000046f4ea	pushq	%rbx
000000000046f4eb	subq	$0x310, %rsp                    ## imm = 0x310
000000000046f4f2	movq	%rdx, %r15
000000000046f4f5	movq	%rsi, %r14
000000000046f4f8	movq	%rdi, %rbx
000000000046f4fb	movq	0x5d8(%rsi), %rdi
000000000046f502	movl	$0x1, %esi
000000000046f507	callq	__ZN11OZImageMask13getMaskSourceEb ## OZImageMask::getMaskSource(bool)
000000000046f50c	movq	0xa0(%r15), %rcx
000000000046f513	movups	(%rcx), %xmm0
000000000046f516	movupd	0x10(%rcx), %xmm1
000000000046f51b	movupd	0x20(%rcx), %xmm2
000000000046f520	movupd	0x30(%rcx), %xmm3
000000000046f525	movups	%xmm0, (%rbx)
000000000046f528	movupd	%xmm1, 0x10(%rbx)
000000000046f52d	movupd	%xmm2, 0x20(%rbx)
000000000046f532	movupd	%xmm3, 0x30(%rbx)
000000000046f537	movups	0x40(%rcx), %xmm0
000000000046f53b	movups	%xmm0, 0x40(%rbx)
000000000046f53f	movups	0x50(%rcx), %xmm0
000000000046f543	movups	%xmm0, 0x50(%rbx)
000000000046f547	movups	0x60(%rcx), %xmm0
000000000046f54b	movups	%xmm0, 0x60(%rbx)
000000000046f54f	movupd	0x70(%rcx), %xmm0
000000000046f554	movupd	%xmm0, 0x70(%rbx)
000000000046f559	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
000000000046f563	movq	%rcx, -0x230(%rbp)
000000000046f56a	movq	%rcx, -0x258(%rbp)
000000000046f571	movq	%rcx, -0x280(%rbp)
000000000046f578	movq	%rcx, -0x2a8(%rbp)
000000000046f57f	xorpd	%xmm0, %xmm0
000000000046f583	movupd	%xmm0, -0x2a0(%rbp)
000000000046f58b	movupd	%xmm0, -0x290(%rbp)
000000000046f593	movupd	%xmm0, -0x278(%rbp)
000000000046f59b	movupd	%xmm0, -0x268(%rbp)
000000000046f5a3	movupd	%xmm0, -0x250(%rbp)
000000000046f5ab	movupd	%xmm0, -0x240(%rbp)
000000000046f5b3	movq	%rcx, -0x130(%rbp)
000000000046f5ba	movq	%rcx, -0x158(%rbp)
000000000046f5c1	movq	%rcx, -0x180(%rbp)
000000000046f5c8	movq	%rcx, -0x1a8(%rbp)
000000000046f5cf	movupd	%xmm0, -0x1a0(%rbp)
000000000046f5d7	movupd	%xmm0, -0x190(%rbp)
000000000046f5df	movupd	%xmm0, -0x178(%rbp)
000000000046f5e7	movupd	%xmm0, -0x168(%rbp)
000000000046f5ef	movupd	%xmm0, -0x150(%rbp)
000000000046f5f7	movupd	%xmm0, -0x140(%rbp)
000000000046f5ff	movq	%rcx, -0x1b0(%rbp)
000000000046f606	movq	%rcx, -0x1d8(%rbp)
000000000046f60d	movq	%rcx, -0x200(%rbp)
000000000046f614	movq	%rcx, -0x228(%rbp)
000000000046f61b	movupd	%xmm0, -0x220(%rbp)
000000000046f623	movupd	%xmm0, -0x210(%rbp)
000000000046f62b	movupd	%xmm0, -0x1f8(%rbp)
000000000046f633	movupd	%xmm0, -0x1e8(%rbp)
000000000046f63b	movupd	%xmm0, -0x1d0(%rbp)
000000000046f643	movupd	%xmm0, -0x1c0(%rbp)
000000000046f64b	testq	%rax, %rax
000000000046f64e	je	0x46f888
000000000046f654	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046f65b	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046f662	movl	$0x1978, %ecx                   ## imm = 0x1978
000000000046f667	movq	%rax, %rdi
000000000046f66a	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046f66f	testq	%rax, %rax
000000000046f672	je	0x46f888
000000000046f678	movq	%rax, %r15
000000000046f67b	leaq	0x10(%r14), %rsi
000000000046f67f	leaq	-0x128(%rbp), %rdi
000000000046f686	callq	__ZN13OZRenderStateC1ERKS_      ## OZRenderState::OZRenderState(OZRenderState const&)
000000000046f68b	movq	0x548(%r14), %r12
000000000046f692	movb	$0x1, -0xe8(%rbp)
000000000046f699	movq	(%r12), %rax
000000000046f69d	leaq	-0x330(%rbp), %rdi
000000000046f6a4	movq	%r12, %rsi
000000000046f6a7	callq	*0x10(%rax)
000000000046f6aa	movaps	-0x330(%rbp), %xmm0
000000000046f6b1	movapd	-0x320(%rbp), %xmm1
000000000046f6b9	movapd	-0x310(%rbp), %xmm2
000000000046f6c1	movapd	-0x300(%rbp), %xmm3
000000000046f6c9	movups	%xmm0, -0xe0(%rbp)
000000000046f6d0	movupd	%xmm1, -0xd0(%rbp)
000000000046f6d8	movupd	%xmm2, -0xc0(%rbp)
000000000046f6e0	movupd	%xmm3, -0xb0(%rbp)
000000000046f6e8	movaps	-0x2f0(%rbp), %xmm0
000000000046f6ef	movups	%xmm0, -0xa0(%rbp)
000000000046f6f6	movaps	-0x2e0(%rbp), %xmm0
000000000046f6fd	movups	%xmm0, -0x90(%rbp)
000000000046f704	movaps	-0x2d0(%rbp), %xmm0
000000000046f70b	movups	%xmm0, -0x80(%rbp)
000000000046f70f	movapd	-0x2c0(%rbp), %xmm0
000000000046f717	movupd	%xmm0, -0x70(%rbp)
000000000046f71c	movq	(%r12), %rax
000000000046f720	movq	%r12, %rdi
000000000046f723	callq	*0x278(%rax)
000000000046f729	testl	%eax, %eax
000000000046f72b	jne	0x46f7bd
000000000046f731	movq	(%r12), %rax
000000000046f735	movq	%r12, %rdi
000000000046f738	callq	*0x140(%rax)
000000000046f73e	xorpd	%xmm1, %xmm1
000000000046f742	ucomisd	%xmm1, %xmm0
000000000046f746	jne	0x46f74a
000000000046f748	jnp	0x46f7bd
000000000046f74a	movsd	-0xd0(%rbp), %xmm1
000000000046f752	mulsd	%xmm0, %xmm1
000000000046f756	movsd	-0xc8(%rbp), %xmm2
000000000046f75e	subsd	%xmm1, %xmm2
000000000046f762	movsd	-0xa8(%rbp), %xmm1
000000000046f76a	movsd	%xmm2, -0xc8(%rbp)
000000000046f772	movsd	-0xb0(%rbp), %xmm2
000000000046f77a	mulsd	%xmm0, %xmm2
000000000046f77e	subsd	%xmm2, %xmm1
000000000046f782	movsd	%xmm1, -0xa8(%rbp)
000000000046f78a	movsd	-0x88(%rbp), %xmm1
000000000046f792	movsd	-0x90(%rbp), %xmm2
000000000046f79a	mulsd	%xmm0, %xmm2
000000000046f79e	subsd	%xmm2, %xmm1
000000000046f7a2	movsd	%xmm1, -0x88(%rbp)
000000000046f7aa	movsd	-0x68(%rbp), %xmm1
000000000046f7af	mulsd	-0x70(%rbp), %xmm0
000000000046f7b4	subsd	%xmm0, %xmm1
000000000046f7b8	movsd	%xmm1, -0x68(%rbp)
000000000046f7bd	movq	(%r12), %rax
000000000046f7c1	movq	%r12, %rdi
000000000046f7c4	callq	*0x1e8(%rax)
000000000046f7ca	ucomisd	0x295c0e(%rip), %xmm0
000000000046f7d2	jne	0x46f7da
000000000046f7d4	jnp	0x46f86e
000000000046f7da	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
000000000046f7de	movupd	-0xe0(%rbp), %xmm2
000000000046f7e6	movupd	-0xc0(%rbp), %xmm3
000000000046f7ee	movupd	-0xa0(%rbp), %xmm4
000000000046f7f6	movupd	-0x80(%rbp), %xmm5
000000000046f7fb	mulpd	%xmm1, %xmm2
000000000046f7ff	movupd	%xmm2, -0xe0(%rbp)
000000000046f807	mulpd	%xmm1, %xmm3
000000000046f80b	movupd	%xmm3, -0xc0(%rbp)
000000000046f813	mulpd	%xmm1, %xmm4
000000000046f817	movupd	%xmm4, -0xa0(%rbp)
000000000046f81f	mulpd	%xmm1, %xmm5
000000000046f823	movupd	%xmm5, -0x80(%rbp)
000000000046f828	movsd	-0xd0(%rbp), %xmm1
000000000046f830	mulsd	%xmm0, %xmm1
000000000046f834	movsd	%xmm1, -0xd0(%rbp)
000000000046f83c	movsd	-0xb0(%rbp), %xmm1
000000000046f844	mulsd	%xmm0, %xmm1
000000000046f848	movsd	%xmm1, -0xb0(%rbp)
000000000046f850	movsd	-0x90(%rbp), %xmm1
000000000046f858	mulsd	%xmm0, %xmm1
000000000046f85c	movsd	%xmm1, -0x90(%rbp)
000000000046f864	mulsd	-0x70(%rbp), %xmm0
000000000046f869	movsd	%xmm0, -0x70(%rbp)
000000000046f86e	movq	(%r15), %rax
000000000046f871	leaq	-0x1a8(%rbp), %rsi
000000000046f878	leaq	-0x128(%rbp), %rdx
000000000046f87f	movq	%r15, %rdi
000000000046f882	callq	*0x500(%rax)
000000000046f888	leaq	-0x2a8(%rbp), %r15
000000000046f88f	leaq	-0x1a8(%rbp), %rsi
000000000046f896	movq	%r15, %rdi
000000000046f899	callq	__ZN14PCMatrix44TmplIdE8leftMultERKS0_ ## PCMatrix44Tmpl<double>::leftMult(PCMatrix44Tmpl<double> const&)
000000000046f89e	movq	0x5d0(%r14), %rax
000000000046f8a5	movq	0x60(%rax), %rdi
000000000046f8a9	addq	$0x10, %r14
000000000046f8ad	movq	(%rdi), %rax
000000000046f8b0	leaq	-0x228(%rbp), %r12
000000000046f8b7	movq	%r12, %rsi
000000000046f8ba	movq	%r14, %rdx
000000000046f8bd	callq	*0x508(%rax)
000000000046f8c3	movq	%r15, %rdi
000000000046f8c6	movq	%r12, %rsi
000000000046f8c9	callq	__ZN14PCMatrix44TmplIdE8leftMultERKS0_ ## PCMatrix44Tmpl<double>::leftMult(PCMatrix44Tmpl<double> const&)
000000000046f8ce	movq	%rbx, %rdi
000000000046f8d1	movq	%r15, %rsi
000000000046f8d4	callq	__ZN14PCMatrix44TmplIdE9rightMultERKS0_ ## PCMatrix44Tmpl<double>::rightMult(PCMatrix44Tmpl<double> const&)
000000000046f8d9	movq	%rbx, %rax
000000000046f8dc	addq	$0x310, %rsp                    ## imm = 0x310
000000000046f8e3	popq	%rbx
000000000046f8e4	popq	%r12
000000000046f8e6	popq	%r14
000000000046f8e8	popq	%r15
000000000046f8ea	popq	%rbp
000000000046f8eb	retq
000000000046f8ec	nopl	(%rax)
