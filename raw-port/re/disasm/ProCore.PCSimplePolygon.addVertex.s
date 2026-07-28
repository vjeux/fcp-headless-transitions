__ZN15PCSimplePolygon9addVertexE9PCVector2IdE:
00000000000c3b78	cmpb	$0x0, (%rdi)
00000000000c3b7b	je	0xc3b80
00000000000c3b7d	xorl	%eax, %eax
00000000000c3b7f	retq
00000000000c3b80	pushq	%rbp
00000000000c3b81	movq	%rsp, %rbp
00000000000c3b84	pushq	%r14
00000000000c3b86	pushq	%rbx
00000000000c3b87	movq	%rsi, %r14
00000000000c3b8a	movq	%rdi, %rbx
00000000000c3b8d	addq	$0x8, %rdi
00000000000c3b91	movq	0x8(%rbx), %rcx
00000000000c3b95	movq	0x10(%rbx), %rax
00000000000c3b99	movq	%rax, %rdx
00000000000c3b9c	subq	%rcx, %rdx
00000000000c3b9f	je	0xc3c34
00000000000c3ba5	movupd	(%r14), %xmm0
00000000000c3baa	movupd	-0x10(%rcx,%rdx), %xmm2
00000000000c3bb0	movapd	%xmm2, %xmm1
00000000000c3bb4	subsd	%xmm0, %xmm1
00000000000c3bb8	andpd	0x5eab0(%rip), %xmm1
00000000000c3bc0	ucomisd	0x5fd50(%rip), %xmm1
00000000000c3bc8	ja	0xc3bef
00000000000c3bca	movapd	%xmm2, %xmm1
00000000000c3bce	subpd	%xmm0, %xmm1
00000000000c3bd2	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000000c3bd6	andpd	0x5ea92(%rip), %xmm1
00000000000c3bde	ucomisd	0x5fd32(%rip), %xmm1
00000000000c3be6	ja	0xc3bef
00000000000c3be8	xorl	%eax, %eax
00000000000c3bea	jmp	0xc3e62
00000000000c3bef	cmpq	$0x21, %rdx
00000000000c3bf3	jb	0xc3c49
00000000000c3bf5	movupd	(%rcx), %xmm4
00000000000c3bf9	movapd	%xmm4, %xmm3
00000000000c3bfd	subpd	%xmm0, %xmm3
00000000000c3c01	shufpd	$0x1, %xmm3, %xmm3              ## xmm3 = xmm3[1,0]
00000000000c3c06	movapd	0x5ea62(%rip), %xmm1
00000000000c3c0e	andpd	%xmm3, %xmm1
00000000000c3c12	movapd	0x64716(%rip), %xmm5
00000000000c3c1a	cmpnltpd	%xmm1, %xmm5
00000000000c3c1f	movmskpd	%xmm5, %eax
00000000000c3c23	cmpl	$0x3, %eax
00000000000c3c26	jne	0xc3cd2
00000000000c3c2c	movb	$0x1, (%rbx)
00000000000c3c2f	jmp	0xc3e60
00000000000c3c34	cmpq	0x18(%rbx), %rax
00000000000c3c38	jae	0xc3cae
00000000000c3c3a	movupd	(%r14), %xmm0
00000000000c3c3f	movupd	%xmm0, (%rax)
00000000000c3c43	addq	$0x10, %rax
00000000000c3c47	jmp	0xc3cbb
00000000000c3c49	cmpq	$0x20, %rdx
00000000000c3c4d	jne	0xc3c97
00000000000c3c4f	movupd	(%rcx), %xmm1
00000000000c3c53	movupd	0x10(%rcx), %xmm2
00000000000c3c58	movapd	%xmm0, %xmm3
00000000000c3c5c	subpd	%xmm1, %xmm3
00000000000c3c60	shufpd	$0x1, %xmm3, %xmm3              ## xmm3 = xmm3[1,0]
00000000000c3c65	subpd	%xmm1, %xmm2
00000000000c3c69	mulpd	%xmm3, %xmm2
00000000000c3c6d	hsubpd	%xmm2, %xmm2
00000000000c3c71	movsd	0x5e92f(%rip), %xmm1
00000000000c3c79	xorl	%ecx, %ecx
00000000000c3c7b	ucomisd	%xmm2, %xmm1
00000000000c3c7f	seta	%cl
00000000000c3c82	negl	%ecx
00000000000c3c84	ucomisd	0x5ec04(%rip), %xmm2
00000000000c3c8c	movl	$0x1, %edx
00000000000c3c91	cmovbel	%ecx, %edx
00000000000c3c94	movl	%edx, 0x4(%rbx)
00000000000c3c97	cmpq	0x18(%rbx), %rax
00000000000c3c9b	jae	0xc3d9f
00000000000c3ca1	movupd	%xmm0, (%rax)
00000000000c3ca5	addq	$0x10, %rax
00000000000c3ca9	jmp	0xc3da7
00000000000c3cae	movq	%r14, %rsi
00000000000c3cb1	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
00000000000c3cb6	movupd	(%r14), %xmm0
00000000000c3cbb	movq	%rax, 0x10(%rbx)
00000000000c3cbf	movupd	%xmm0, 0x20(%rbx)
00000000000c3cc4	subpd	%xmm0, %xmm0
00000000000c3cc8	movupd	%xmm0, 0x30(%rbx)
00000000000c3ccd	jmp	0xc3e60
00000000000c3cd2	movupd	-0x20(%rcx,%rdx), %xmm1
00000000000c3cd8	movapd	%xmm0, %xmm5
00000000000c3cdc	subpd	%xmm1, %xmm5
00000000000c3ce0	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
00000000000c3ce5	movapd	%xmm2, %xmm7
00000000000c3ce9	subpd	%xmm1, %xmm7
00000000000c3ced	mulpd	%xmm5, %xmm7
00000000000c3cf1	hsubpd	%xmm7, %xmm7
00000000000c3cf5	movsd	0x5e8ab(%rip), %xmm5
00000000000c3cfd	xorl	%eax, %eax
00000000000c3cff	ucomisd	%xmm7, %xmm5
00000000000c3d03	seta	%al
00000000000c3d06	negl	%eax
00000000000c3d08	movsd	0x5eb80(%rip), %xmm6
00000000000c3d10	ucomisd	%xmm6, %xmm7
00000000000c3d14	movl	$0x1, %esi
00000000000c3d19	cmoval	%esi, %eax
00000000000c3d1c	subpd	%xmm2, %xmm4
00000000000c3d20	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
00000000000c3d25	movapd	%xmm0, %xmm7
00000000000c3d29	subpd	%xmm2, %xmm7
00000000000c3d2d	mulpd	%xmm4, %xmm7
00000000000c3d31	hsubpd	%xmm7, %xmm7
00000000000c3d35	xorl	%edx, %edx
00000000000c3d37	ucomisd	%xmm7, %xmm5
00000000000c3d3b	seta	%dl
00000000000c3d3e	negl	%edx
00000000000c3d40	ucomisd	%xmm6, %xmm7
00000000000c3d44	cmoval	%esi, %edx
00000000000c3d47	movupd	0x10(%rcx), %xmm2
00000000000c3d4c	subpd	%xmm0, %xmm2
00000000000c3d50	mulpd	%xmm2, %xmm3
00000000000c3d54	movapd	%xmm3, %xmm2
00000000000c3d58	unpckhpd	%xmm3, %xmm2                    ## xmm2 = xmm2[1],xmm3[1]
00000000000c3d5c	subsd	%xmm3, %xmm2
00000000000c3d60	xorl	%ecx, %ecx
00000000000c3d62	ucomisd	%xmm2, %xmm5
00000000000c3d66	seta	%cl
00000000000c3d69	negl	%ecx
00000000000c3d6b	ucomisd	%xmm6, %xmm2
00000000000c3d6f	cmoval	%esi, %ecx
00000000000c3d72	testl	%eax, %eax
00000000000c3d74	je	0xc3dad
00000000000c3d76	movl	0x4(%rbx), %esi
00000000000c3d79	testl	%esi, %esi
00000000000c3d7b	je	0xc3de7
00000000000c3d7d	cmpl	%esi, %eax
00000000000c3d7f	jne	0xc3be8
00000000000c3d85	testl	%edx, %edx
00000000000c3d87	je	0xc3d91
00000000000c3d89	cmpl	%eax, %edx
00000000000c3d8b	jne	0xc3be8
00000000000c3d91	testl	%ecx, %ecx
00000000000c3d93	je	0xc3dea
00000000000c3d95	cmpl	%eax, %ecx
00000000000c3d97	jne	0xc3be8
00000000000c3d9d	jmp	0xc3dea
00000000000c3d9f	movq	%r14, %rsi
00000000000c3da2	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
00000000000c3da7	movq	%rax, 0x10(%rbx)
00000000000c3dab	jmp	0xc3df2
00000000000c3dad	movapd	%xmm1, %xmm2
00000000000c3db1	subsd	%xmm0, %xmm2
00000000000c3db5	andpd	0x5e8b3(%rip), %xmm2
00000000000c3dbd	ucomisd	0x5fb53(%rip), %xmm2
00000000000c3dc5	ja	0xc3dea
00000000000c3dc7	subpd	%xmm0, %xmm1
00000000000c3dcb	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000000c3dcf	andpd	0x5e899(%rip), %xmm1
00000000000c3dd7	ucomisd	0x5fb39(%rip), %xmm1
00000000000c3ddf	jbe	0xc3be8
00000000000c3de5	jmp	0xc3dea
00000000000c3de7	movl	%eax, 0x4(%rbx)
00000000000c3dea	movq	%r14, %rsi
00000000000c3ded	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::push_back[abi:nqe210106](PCVector2<double> const&)
00000000000c3df2	movsd	0x20(%rbx), %xmm0
00000000000c3df7	movsd	0x28(%rbx), %xmm1
00000000000c3dfc	movsd	0x30(%rbx), %xmm3
00000000000c3e01	addsd	%xmm0, %xmm3
00000000000c3e05	movsd	(%r14), %xmm2
00000000000c3e0a	ucomisd	%xmm2, %xmm0
00000000000c3e0e	jbe	0xc3e16
00000000000c3e10	movapd	%xmm2, %xmm0
00000000000c3e14	jmp	0xc3e1c
00000000000c3e16	ucomisd	%xmm3, %xmm2
00000000000c3e1a	ja	0xc3e20
00000000000c3e1c	movapd	%xmm3, %xmm2
00000000000c3e20	movsd	0x38(%rbx), %xmm4
00000000000c3e25	addsd	%xmm1, %xmm4
00000000000c3e29	movsd	0x8(%r14), %xmm3
00000000000c3e2f	ucomisd	%xmm3, %xmm1
00000000000c3e33	jbe	0xc3e3b
00000000000c3e35	movapd	%xmm3, %xmm1
00000000000c3e39	jmp	0xc3e41
00000000000c3e3b	ucomisd	%xmm4, %xmm3
00000000000c3e3f	ja	0xc3e45
00000000000c3e41	movapd	%xmm4, %xmm3
00000000000c3e45	unpcklpd	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0]
00000000000c3e49	movsd	%xmm0, 0x20(%rbx)
00000000000c3e4e	movsd	%xmm1, 0x28(%rbx)
00000000000c3e53	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000000c3e57	subpd	%xmm0, %xmm2
00000000000c3e5b	movupd	%xmm2, 0x30(%rbx)
00000000000c3e60	movb	$0x1, %al
00000000000c3e62	popq	%rbx
00000000000c3e63	popq	%r14
00000000000c3e65	popq	%rbp
00000000000c3e66	retq
00000000000c3e67	nop
