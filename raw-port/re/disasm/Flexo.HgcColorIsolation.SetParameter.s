__ZN17HgcColorIsolation12SetParameterEiffff:
000000000145e670	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000145e675	cmpl	$0x8, %esi
000000000145e678	ja	0x145e6e3
000000000145e67a	movq	0x198(%rdi), %rcx
000000000145e681	movl	%esi, %edx
000000000145e683	shlq	$0x5, %rdx
000000000145e687	leaq	(%rcx,%rdx), %rax
000000000145e68b	movss	(%rcx,%rdx), %xmm4
000000000145e690	ucomiss	%xmm0, %xmm4
000000000145e693	jne	0x145e6bb
000000000145e695	jp	0x145e6bb
000000000145e697	movss	0x4(%rax), %xmm4
000000000145e69c	ucomiss	%xmm1, %xmm4
000000000145e69f	jne	0x145e6bb
000000000145e6a1	jp	0x145e6bb
000000000145e6a3	movss	0x8(%rax), %xmm4
000000000145e6a8	ucomiss	%xmm2, %xmm4
000000000145e6ab	jne	0x145e6bb
000000000145e6ad	jp	0x145e6bb
000000000145e6af	movss	0xc(%rax), %xmm4
000000000145e6b4	ucomiss	%xmm3, %xmm4
000000000145e6b7	jne	0x145e6bb
000000000145e6b9	jnp	0x145e6e4
000000000145e6bb	pushq	%rbp
000000000145e6bc	movq	%rsp, %rbp
000000000145e6bf	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000145e6c5	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000145e6cb	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000145e6d1	movups	%xmm0, 0x10(%rax)
000000000145e6d5	movups	%xmm0, (%rax)
000000000145e6d8	callq	0x1496bfa                       ## symbol stub for: __ZN6HGNode9ClearBitsEv
000000000145e6dd	movl	$0x1, %eax
000000000145e6e2	popq	%rbp
000000000145e6e3	retq
000000000145e6e4	xorl	%eax, %eax
000000000145e6e6	retq
000000000145e6e7	nopw	(%rax,%rax)
