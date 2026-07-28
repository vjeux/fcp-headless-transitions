__ZN25HgcBT2100_HLG_InverseOETF12SetParameterEiffff:
00000000003b20f0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003b20f5	cmpl	$0x1, %esi
00000000003b20f8	ja	0x3b2163
00000000003b20fa	movq	0x198(%rdi), %rcx
00000000003b2101	movl	%esi, %edx
00000000003b2103	shlq	$0x5, %rdx
00000000003b2107	leaq	(%rcx,%rdx), %rax
00000000003b210b	movss	(%rcx,%rdx), %xmm4
00000000003b2110	ucomiss	%xmm0, %xmm4
00000000003b2113	jne	0x3b213b
00000000003b2115	jp	0x3b213b
00000000003b2117	movss	0x4(%rax), %xmm4
00000000003b211c	ucomiss	%xmm1, %xmm4
00000000003b211f	jne	0x3b213b
00000000003b2121	jp	0x3b213b
00000000003b2123	movss	0x8(%rax), %xmm4
00000000003b2128	ucomiss	%xmm2, %xmm4
00000000003b212b	jne	0x3b213b
00000000003b212d	jp	0x3b213b
00000000003b212f	movss	0xc(%rax), %xmm4
00000000003b2134	ucomiss	%xmm3, %xmm4
00000000003b2137	jne	0x3b213b
00000000003b2139	jnp	0x3b2164
00000000003b213b	pushq	%rbp
00000000003b213c	movq	%rsp, %rbp
00000000003b213f	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000003b2145	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
00000000003b214b	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
00000000003b2151	movups	%xmm0, 0x10(%rax)
00000000003b2155	movups	%xmm0, (%rax)
00000000003b2158	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000003b215d	movl	$0x1, %eax
00000000003b2162	popq	%rbp
00000000003b2163	retq
00000000003b2164	xorl	%eax, %eax
00000000003b2166	retq
00000000003b2167	nopw	(%rax,%rax)
