__ZNK21HGColorConformLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
00000000001d2640	pushq	%rbp
00000000001d2641	movq	%rsp, %rbp
00000000001d2644	pushq	%r15
00000000001d2646	pushq	%r14
00000000001d2648	pushq	%r13
00000000001d264a	pushq	%r12
00000000001d264c	pushq	%rbx
00000000001d264d	subq	$0x78, %rsp
00000000001d2651	movq	%r8, %r15
00000000001d2654	movq	%rcx, %r12
00000000001d2657	movq	%rdx, -0x50(%rbp)
00000000001d265b	movq	%rsi, -0x48(%rbp)
00000000001d265f	movaps	%xmm2, -0x90(%rbp)
00000000001d2666	movaps	%xmm1, -0x70(%rbp)
00000000001d266a	movaps	%xmm0, -0x40(%rbp)
00000000001d266e	movq	%rdi, %rbx
00000000001d2671	callq	__ZNK16HGApplyNDLUTInfo10getNumDimsEv ## HGApplyNDLUTInfo::getNumDims() const
00000000001d2676	movq	%rax, %r14
00000000001d2679	movq	%rbx, %rdi
00000000001d267c	callq	__ZNK16HGApplyNDLUTInfo10getNumBinsEv ## HGApplyNDLUTInfo::getNumBins() const
00000000001d2681	movq	%rax, %r13
00000000001d2684	cmpq	$0x3, %r14
00000000001d2688	je	0x1d26dc
00000000001d268a	cmpq	$0x1, %r14
00000000001d268e	jne	0x1d2740
00000000001d2694	movq	%rbx, %rdi
00000000001d2697	callq	__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv ## HGComicImplementation::GetEdgeThresholdCoeffAdj() const
00000000001d269c	movaps	-0x40(%rbp), %xmm1
00000000001d26a0	subss	%xmm0, %xmm1
00000000001d26a4	movaps	%xmm1, -0x40(%rbp)
00000000001d26a8	movq	%rbx, %rdi
00000000001d26ab	callq	__ZNK16HGApplyNDLUTInfo13getRangeScaleEv ## HGApplyNDLUTInfo::getRangeScale() const
00000000001d26b0	movaps	-0x40(%rbp), %xmm1
00000000001d26b4	divss	%xmm0, %xmm1
00000000001d26b8	minss	0x1f5600(%rip), %xmm1
00000000001d26c0	xorps	%xmm0, %xmm0
00000000001d26c3	maxss	%xmm0, %xmm1
00000000001d26c7	movq	%r13, %rax
00000000001d26ca	decq	%rax
00000000001d26cd	js	0x1d2749
00000000001d26cf	xorps	%xmm0, %xmm0
00000000001d26d2	cvtsi2ss	%rax, %xmm0
00000000001d26d7	jmp	0x1d2761
00000000001d26dc	movq	0x28(%rbx), %rax
00000000001d26e0	movl	0x20(%rax), %eax
00000000001d26e3	movl	%eax, -0x74(%rbp)
00000000001d26e6	movq	%rbx, %rdi
00000000001d26e9	callq	__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv ## HGComicImplementation::GetEdgeThresholdCoeffAdj() const
00000000001d26ee	movaps	-0x40(%rbp), %xmm1
00000000001d26f2	subss	%xmm0, %xmm1
00000000001d26f6	movaps	%xmm1, -0x40(%rbp)
00000000001d26fa	movq	%rbx, %rdi
00000000001d26fd	callq	__ZNK16HGApplyNDLUTInfo13getRangeScaleEv ## HGApplyNDLUTInfo::getRangeScale() const
00000000001d2702	movaps	-0x40(%rbp), %xmm1
00000000001d2706	divss	%xmm0, %xmm1
00000000001d270a	minss	0x1f55ae(%rip), %xmm1
00000000001d2712	xorps	%xmm0, %xmm0
00000000001d2715	maxss	%xmm0, %xmm1
00000000001d2719	movq	%r13, %rax
00000000001d271c	decq	%rax
00000000001d271f	movq	%r15, -0xa0(%rbp)
00000000001d2726	movq	%r12, -0x98(%rbp)
00000000001d272d	js	0x1d2802
00000000001d2733	xorps	%xmm0, %xmm0
00000000001d2736	cvtsi2ss	%rax, %xmm0
00000000001d273b	jmp	0x1d281a
00000000001d2740	movq	%rbx, %rdi
00000000001d2743	movaps	-0x40(%rbp), %xmm0
00000000001d2747	jmp	0x1d2792
00000000001d2749	movq	%rax, %rcx
00000000001d274c	shrq	%rcx
00000000001d274f	andl	$0x1, %eax
00000000001d2752	orq	%rcx, %rax
00000000001d2755	xorps	%xmm0, %xmm0
00000000001d2758	cvtsi2ss	%rax, %xmm0
00000000001d275d	addss	%xmm0, %xmm0
00000000001d2761	mulss	%xmm0, %xmm1
00000000001d2765	movaps	0x1f7964(%rip), %xmm0
00000000001d276c	andps	%xmm1, %xmm0
00000000001d276f	orps	0x1f7b9a(%rip), %xmm0
00000000001d2776	addss	%xmm1, %xmm0
00000000001d277a	roundss	$0xb, %xmm0, %xmm0
00000000001d2780	cvttss2si	%xmm0, %eax
00000000001d2784	movslq	%eax, %rcx
00000000001d2787	cmpq	%rcx, %r13
00000000001d278a	jae	0x1d27be
00000000001d278c	movq	%rbx, %rdi
00000000001d278f	movaps	%xmm1, %xmm0
00000000001d2792	movaps	-0x70(%rbp), %xmm1
00000000001d2796	movaps	-0x90(%rbp), %xmm2
00000000001d279d	movq	-0x48(%rbp), %rsi
00000000001d27a1	movq	-0x50(%rbp), %rdx
00000000001d27a5	movq	%r12, %rcx
00000000001d27a8	movq	%r15, %r8
00000000001d27ab	addq	$0x78, %rsp
00000000001d27af	popq	%rbx
00000000001d27b0	popq	%r12
00000000001d27b2	popq	%r13
00000000001d27b4	popq	%r14
00000000001d27b6	popq	%r15
00000000001d27b8	popq	%rbp
00000000001d27b9	jmp	__ZNK16HGApplyNDLUTInfo12colorAtIndexEfffPfS0_S0_S0_ ## HGApplyNDLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const
00000000001d27be	movq	0x28(%rbx), %rcx
00000000001d27c2	movq	0x18(%rcx), %rcx
00000000001d27c6	shll	$0x2, %eax
00000000001d27c9	cltq
00000000001d27cb	movss	(%rcx,%rax,4), %xmm0
00000000001d27d0	movq	-0x48(%rbp), %rdx
00000000001d27d4	movss	%xmm0, (%rdx)
00000000001d27d8	movss	0x4(%rcx,%rax,4), %xmm0
00000000001d27de	movq	-0x50(%rbp), %rdx
00000000001d27e2	movss	%xmm0, (%rdx)
00000000001d27e6	movss	0x8(%rcx,%rax,4), %xmm0
00000000001d27ec	movss	%xmm0, (%r12)
00000000001d27f2	movss	0xc(%rcx,%rax,4), %xmm0
00000000001d27f8	movss	%xmm0, (%r15)
00000000001d27fd	jmp	0x1d29f9
00000000001d2802	movq	%rax, %rcx
00000000001d2805	shrq	%rcx
00000000001d2808	andl	$0x1, %eax
00000000001d280b	orq	%rcx, %rax
00000000001d280e	xorps	%xmm0, %xmm0
00000000001d2811	cvtsi2ss	%rax, %xmm0
00000000001d2816	addss	%xmm0, %xmm0
00000000001d281a	movss	%xmm0, -0x54(%rbp)
00000000001d281f	mulss	%xmm0, %xmm1
00000000001d2823	movaps	%xmm1, -0x40(%rbp)
00000000001d2827	movq	%rbx, %rdi
00000000001d282a	callq	__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv ## HGComicImplementation::GetEdgeThresholdCoeffAdj() const
00000000001d282f	movaps	-0x70(%rbp), %xmm1
00000000001d2833	subss	%xmm0, %xmm1
00000000001d2837	movaps	%xmm1, -0x70(%rbp)
00000000001d283b	movq	%rbx, %rdi
00000000001d283e	callq	__ZNK16HGApplyNDLUTInfo13getRangeScaleEv ## HGApplyNDLUTInfo::getRangeScale() const
00000000001d2843	movaps	-0x70(%rbp), %xmm1
00000000001d2847	divss	%xmm0, %xmm1
00000000001d284b	movss	0x1f546d(%rip), %xmm0
00000000001d2853	minss	%xmm0, %xmm1
00000000001d2857	xorps	%xmm0, %xmm0
00000000001d285a	maxss	%xmm0, %xmm1
00000000001d285e	mulss	-0x54(%rbp), %xmm1
00000000001d2863	movaps	%xmm1, -0x70(%rbp)
00000000001d2867	movq	%rbx, %rdi
00000000001d286a	callq	__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv ## HGComicImplementation::GetEdgeThresholdCoeffAdj() const
00000000001d286f	movaps	-0x90(%rbp), %xmm1
00000000001d2876	subss	%xmm0, %xmm1
00000000001d287a	movaps	%xmm1, -0x90(%rbp)
00000000001d2881	movq	%rbx, %rdi
00000000001d2884	callq	__ZNK16HGApplyNDLUTInfo13getRangeScaleEv ## HGApplyNDLUTInfo::getRangeScale() const
00000000001d2889	movaps	-0x90(%rbp), %xmm1
00000000001d2890	divss	%xmm0, %xmm1
00000000001d2894	minss	0x1f5424(%rip), %xmm1
00000000001d289c	xorps	%xmm0, %xmm0
00000000001d289f	maxss	%xmm0, %xmm1
00000000001d28a3	mulss	-0x54(%rbp), %xmm1
00000000001d28a8	movaps	%xmm1, %xmm4
00000000001d28ab	movaps	0x1f781e(%rip), %xmm0
00000000001d28b2	movaps	-0x40(%rbp), %xmm3
00000000001d28b6	movaps	%xmm3, %xmm1
00000000001d28b9	andps	%xmm0, %xmm1
00000000001d28bc	movaps	0x1f7a4d(%rip), %xmm2
00000000001d28c3	orps	%xmm2, %xmm1
00000000001d28c6	addss	%xmm3, %xmm1
00000000001d28ca	roundss	$0xb, %xmm1, %xmm1
00000000001d28d0	cvttss2si	%xmm1, %r14d
00000000001d28d5	movaps	-0x70(%rbp), %xmm3
00000000001d28d9	movaps	%xmm3, %xmm1
00000000001d28dc	andps	%xmm0, %xmm1
00000000001d28df	orps	%xmm2, %xmm1
00000000001d28e2	addss	%xmm3, %xmm1
00000000001d28e6	roundss	$0xb, %xmm1, %xmm1
00000000001d28ec	cvttss2si	%xmm1, %r12d
00000000001d28f1	andps	%xmm4, %xmm0
00000000001d28f4	orps	%xmm2, %xmm0
00000000001d28f7	addss	%xmm4, %xmm0
00000000001d28fb	roundss	$0xb, %xmm0, %xmm0
00000000001d2901	cvttss2si	%xmm0, %eax
00000000001d2905	movl	%eax, -0x40(%rbp)
00000000001d2908	movl	-0x74(%rbp), %r15d
00000000001d290c	movl	%r15d, %edi
00000000001d290f	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000001d2914	movl	%eax, %ecx
00000000001d2916	movq	%r13, %rax
00000000001d2919	imulq	%rcx, %rax
00000000001d291d	imulq	%rax, %r13
00000000001d2921	cmpl	$0x19, %r15d
00000000001d2925	je	0x1d292d
00000000001d2927	cmpl	$0x13, %r15d
00000000001d292b	jne	0x1d299b
00000000001d292d	movq	0x28(%rbx), %rdx
00000000001d2931	movslq	%r14d, %rsi
00000000001d2934	imulq	%rcx, %rsi
00000000001d2938	addq	0x18(%rdx), %rsi
00000000001d293c	movslq	%r12d, %rcx
00000000001d293f	imulq	%rcx, %rax
00000000001d2943	addq	%rsi, %rax
00000000001d2946	movslq	-0x40(%rbp), %rcx
00000000001d294a	imulq	%rcx, %r13
00000000001d294e	movzwl	(%r13,%rax), %ecx
00000000001d2954	xorps	%xmm0, %xmm0
00000000001d2957	cvtsi2ss	%ecx, %xmm0
00000000001d295b	movss	0x1fa391(%rip), %xmm1
00000000001d2963	divss	%xmm1, %xmm0
00000000001d2967	movq	-0x48(%rbp), %rcx
00000000001d296b	movss	%xmm0, (%rcx)
00000000001d296f	movzwl	0x2(%r13,%rax), %ecx
00000000001d2975	xorps	%xmm0, %xmm0
00000000001d2978	cvtsi2ss	%ecx, %xmm0
00000000001d297c	divss	%xmm1, %xmm0
00000000001d2980	movq	-0x50(%rbp), %rcx
00000000001d2984	movss	%xmm0, (%rcx)
00000000001d2988	movzwl	0x4(%r13,%rax), %eax
00000000001d298e	xorps	%xmm0, %xmm0
00000000001d2991	cvtsi2ss	%eax, %xmm0
00000000001d2995	divss	%xmm1, %xmm0
00000000001d2999	jmp	0x1d29e1
00000000001d299b	movq	0x28(%rbx), %rdx
00000000001d299f	movslq	%r14d, %rsi
00000000001d29a2	imulq	%rcx, %rsi
00000000001d29a6	addq	0x18(%rdx), %rsi
00000000001d29aa	movslq	%r12d, %rcx
00000000001d29ad	imulq	%rcx, %rax
00000000001d29b1	addq	%rsi, %rax
00000000001d29b4	movslq	-0x40(%rbp), %rcx
00000000001d29b8	imulq	%rcx, %r13
00000000001d29bc	movss	(%r13,%rax), %xmm0
00000000001d29c3	movq	-0x48(%rbp), %rcx
00000000001d29c7	movss	%xmm0, (%rcx)
00000000001d29cb	movss	0x4(%r13,%rax), %xmm0
00000000001d29d2	movq	-0x50(%rbp), %rcx
00000000001d29d6	movss	%xmm0, (%rcx)
00000000001d29da	movss	0x8(%r13,%rax), %xmm0
00000000001d29e1	movq	-0x98(%rbp), %rax
00000000001d29e8	movss	%xmm0, (%rax)
00000000001d29ec	movq	-0xa0(%rbp), %rax
00000000001d29f3	movl	$0x3f800000, (%rax)             ## imm = 0x3F800000
00000000001d29f9	addq	$0x78, %rsp
00000000001d29fd	popq	%rbx
00000000001d29fe	popq	%r12
00000000001d2a00	popq	%r13
00000000001d2a02	popq	%r14
00000000001d2a04	popq	%r15
00000000001d2a06	popq	%rbp
00000000001d2a07	retq
00000000001d2a08	nopl	(%rax,%rax)
