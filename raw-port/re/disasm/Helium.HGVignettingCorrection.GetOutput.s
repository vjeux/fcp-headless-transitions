__ZN22HGVignettingCorrection9GetOutputEP10HGRenderer:
000000000023f080	pushq	%rbp
000000000023f081	movq	%rsp, %rbp
000000000023f084	pushq	%r14
000000000023f086	pushq	%rbx
000000000023f087	subq	$0x30, %rsp
000000000023f08b	movq	%rdi, %rbx
000000000023f08e	movq	%rsi, %rdi
000000000023f091	movq	%rbx, %rsi
000000000023f094	xorl	%edx, %edx
000000000023f096	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000023f09b	movss	0x19c(%rbx), %xmm3
000000000023f0a3	xorps	%xmm0, %xmm0
000000000023f0a6	ucomiss	%xmm0, %xmm3
000000000023f0a9	jne	0x23f0b1
000000000023f0ab	jnp	0x23f2e3
000000000023f0b1	movsd	0x1a4(%rbx), %xmm1
000000000023f0b9	movaps	0x18af30(%rip), %xmm0
000000000023f0c0	mulps	%xmm1, %xmm0
000000000023f0c3	mulps	%xmm0, %xmm0
000000000023f0c6	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
000000000023f0ca	addss	%xmm0, %xmm2
000000000023f0ce	xorps	%xmm0, %xmm0
000000000023f0d1	sqrtss	%xmm2, %xmm0
000000000023f0d5	mulss	%xmm0, %xmm3
000000000023f0d9	movss	%xmm3, -0x18(%rbp)
000000000023f0de	movss	0x198(%rbx), %xmm3
000000000023f0e6	movss	0x188bd2(%rip), %xmm2
000000000023f0ee	subss	%xmm3, %xmm2
000000000023f0f2	xorps	%xmm0, %xmm0
000000000023f0f5	cmpnless	%xmm3, %xmm0
000000000023f0fa	mulss	0x18b192(%rip), %xmm3
000000000023f102	addss	%xmm2, %xmm3
000000000023f106	movaps	0x188b23(%rip), %xmm2
000000000023f10d	andps	%xmm3, %xmm2
000000000023f110	blendvps	%xmm0, %xmm2, %xmm3
000000000023f115	movaps	%xmm3, -0x30(%rbp)
000000000023f119	xorps	%xmm0, %xmm0
000000000023f11c	cvtss2sd	%xmm3, %xmm0
000000000023f120	movsd	0x18b138(%rip), %xmm2
000000000023f128	movapd	%xmm2, %xmm3
000000000023f12c	divsd	%xmm0, %xmm3
000000000023f130	subsd	%xmm3, %xmm2
000000000023f134	xorps	%xmm0, %xmm0
000000000023f137	cvtsd2ss	%xmm2, %xmm0
000000000023f13b	movss	%xmm0, -0x14(%rbp)
000000000023f140	movss	0x1a0(%rbx), %xmm0
000000000023f148	movss	0x1ac(%rbx), %xmm2
000000000023f150	mulss	%xmm1, %xmm2
000000000023f154	movss	%xmm2, -0x1c(%rbp)
000000000023f159	movshdup	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1,3,3]
000000000023f15d	mulss	0x1b0(%rbx), %xmm1
000000000023f165	movaps	%xmm1, -0x40(%rbp)
000000000023f169	movq	0x1c0(%rbx), %rdi
000000000023f170	movq	(%rdi), %rcx
000000000023f173	xorl	%esi, %esi
000000000023f175	movaps	%xmm0, %xmm1
000000000023f178	movaps	%xmm0, %xmm2
000000000023f17b	movaps	%xmm0, %xmm3
000000000023f17e	movq	%rax, %r14
000000000023f181	callq	*0x60(%rcx)
000000000023f184	movq	0x1c0(%rbx), %rdi
000000000023f18b	movq	(%rdi), %rax
000000000023f18e	movl	$0x1, %esi
000000000023f193	movaps	-0x30(%rbp), %xmm0
000000000023f197	movaps	%xmm0, %xmm1
000000000023f19a	movaps	%xmm0, %xmm2
000000000023f19d	movaps	%xmm0, %xmm3
000000000023f1a0	callq	*0x60(%rax)
000000000023f1a3	movq	0x1c0(%rbx), %rdi
000000000023f1aa	movq	(%rdi), %rax
000000000023f1ad	movl	$0x2, %esi
000000000023f1b2	movss	-0x14(%rbp), %xmm0
000000000023f1b7	movaps	%xmm0, %xmm1
000000000023f1ba	movaps	%xmm0, %xmm2
000000000023f1bd	movaps	%xmm0, %xmm3
000000000023f1c0	callq	*0x60(%rax)
000000000023f1c3	movq	0x1c0(%rbx), %rdi
000000000023f1ca	movq	(%rdi), %rax
000000000023f1cd	movl	$0x3, %esi
000000000023f1d2	movss	-0x18(%rbp), %xmm0
000000000023f1d7	movaps	%xmm0, %xmm1
000000000023f1da	movaps	%xmm0, %xmm2
000000000023f1dd	movaps	%xmm0, %xmm3
000000000023f1e0	callq	*0x60(%rax)
000000000023f1e3	movq	0x1c0(%rbx), %rdi
000000000023f1ea	movq	(%rdi), %rax
000000000023f1ed	xorps	%xmm2, %xmm2
000000000023f1f0	xorps	%xmm3, %xmm3
000000000023f1f3	movl	$0x4, %esi
000000000023f1f8	movss	-0x1c(%rbp), %xmm0
000000000023f1fd	movaps	-0x40(%rbp), %xmm1
000000000023f201	callq	*0x60(%rax)
000000000023f204	movq	0x1c8(%rbx), %rdi
000000000023f20b	movss	0x1a0(%rbx), %xmm0
000000000023f213	movq	(%rdi), %rax
000000000023f216	xorl	%esi, %esi
000000000023f218	movaps	%xmm0, %xmm1
000000000023f21b	movaps	%xmm0, %xmm2
000000000023f21e	movaps	%xmm0, %xmm3
000000000023f221	callq	*0x60(%rax)
000000000023f224	movq	0x1c8(%rbx), %rdi
000000000023f22b	movq	(%rdi), %rax
000000000023f22e	movl	$0x1, %esi
000000000023f233	movaps	-0x30(%rbp), %xmm0
000000000023f237	movaps	%xmm0, %xmm1
000000000023f23a	movaps	%xmm0, %xmm2
000000000023f23d	movaps	%xmm0, %xmm3
000000000023f240	callq	*0x60(%rax)
000000000023f243	movq	0x1c8(%rbx), %rdi
000000000023f24a	movq	(%rdi), %rax
000000000023f24d	movl	$0x2, %esi
000000000023f252	movss	-0x14(%rbp), %xmm0
000000000023f257	movaps	%xmm0, %xmm1
000000000023f25a	movaps	%xmm0, %xmm2
000000000023f25d	movaps	%xmm0, %xmm3
000000000023f260	callq	*0x60(%rax)
000000000023f263	movq	0x1c8(%rbx), %rdi
000000000023f26a	movq	(%rdi), %rax
000000000023f26d	movl	$0x3, %esi
000000000023f272	movss	-0x18(%rbp), %xmm0
000000000023f277	movaps	%xmm0, %xmm1
000000000023f27a	movaps	%xmm0, %xmm2
000000000023f27d	movaps	%xmm0, %xmm3
000000000023f280	callq	*0x60(%rax)
000000000023f283	movq	0x1c8(%rbx), %rdi
000000000023f28a	movq	(%rdi), %rax
000000000023f28d	xorps	%xmm2, %xmm2
000000000023f290	xorps	%xmm3, %xmm3
000000000023f293	movl	$0x4, %esi
000000000023f298	movss	-0x1c(%rbp), %xmm0
000000000023f29d	movaps	-0x40(%rbp), %xmm1
000000000023f2a1	callq	*0x60(%rax)
000000000023f2a4	movq	0x1c0(%rbx), %rdi
000000000023f2ab	movq	(%rdi), %rax
000000000023f2ae	xorl	%esi, %esi
000000000023f2b0	movq	%r14, %rdx
000000000023f2b3	callq	*0x78(%rax)
000000000023f2b6	movq	0x1c8(%rbx), %rdi
000000000023f2bd	movq	(%rdi), %rax
000000000023f2c0	xorl	%esi, %esi
000000000023f2c2	movq	%r14, %rdx
000000000023f2c5	callq	*0x78(%rax)
000000000023f2c8	movss	0x198(%rbx), %xmm0
000000000023f2d0	xorl	%eax, %eax
000000000023f2d2	xorps	%xmm1, %xmm1
000000000023f2d5	ucomiss	%xmm1, %xmm0
000000000023f2d8	setae	%al
000000000023f2db	movq	0x1c0(%rbx,%rax,8), %rax
000000000023f2e3	addq	$0x30, %rsp
000000000023f2e7	popq	%rbx
000000000023f2e8	popq	%r14
000000000023f2ea	popq	%rbp
000000000023f2eb	retq
000000000023f2ec	nopl	(%rax)
