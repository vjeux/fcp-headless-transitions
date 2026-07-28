__ZN18HgcBT2100_HLG_OETF12SetParameterEiffff:
00000000003b1210	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003b1215	cmpl	$0x1, %esi
00000000003b1218	ja	0x3b1283
00000000003b121a	movq	0x198(%rdi), %rcx
00000000003b1221	movl	%esi, %edx
00000000003b1223	shlq	$0x5, %rdx
00000000003b1227	leaq	(%rcx,%rdx), %rax
00000000003b122b	movss	(%rcx,%rdx), %xmm4
00000000003b1230	ucomiss	%xmm0, %xmm4
00000000003b1233	jne	0x3b125b
00000000003b1235	jp	0x3b125b
00000000003b1237	movss	0x4(%rax), %xmm4
00000000003b123c	ucomiss	%xmm1, %xmm4
00000000003b123f	jne	0x3b125b
00000000003b1241	jp	0x3b125b
00000000003b1243	movss	0x8(%rax), %xmm4
00000000003b1248	ucomiss	%xmm2, %xmm4
00000000003b124b	jne	0x3b125b
00000000003b124d	jp	0x3b125b
00000000003b124f	movss	0xc(%rax), %xmm4
00000000003b1254	ucomiss	%xmm3, %xmm4
00000000003b1257	jne	0x3b125b
00000000003b1259	jnp	0x3b1284
00000000003b125b	pushq	%rbp
00000000003b125c	movq	%rsp, %rbp
00000000003b125f	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000003b1265	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
00000000003b126b	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
00000000003b1271	movups	%xmm0, 0x10(%rax)
00000000003b1275	movups	%xmm0, (%rax)
00000000003b1278	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000003b127d	movl	$0x1, %eax
00000000003b1282	popq	%rbp
00000000003b1283	retq
00000000003b1284	xorl	%eax, %eax
00000000003b1286	retq
00000000003b1287	nopw	(%rax,%rax)
