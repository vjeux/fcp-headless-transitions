__ZN8cc_YCbCr3rgbEv:
0000000000096c04	pushq	%rbp
0000000000096c05	movq	%rsp, %rbp
0000000000096c08	pushq	%rbx
0000000000096c09	subq	$0x18, %rsp
0000000000096c0d	movups	(%rdi), %xmm0
0000000000096c10	movaps	%xmm0, -0x20(%rbp)
0000000000096c14	movl	0xc(%rdi), %eax
0000000000096c17	decl	%eax
0000000000096c19	cmpl	$0x2, %eax
0000000000096c1c	ja	0x96c3e
0000000000096c1e	movl	%eax, %eax
0000000000096c20	leaq	0xb5759(%rip), %rcx
0000000000096c27	movq	(%rcx,%rax,8), %rsi
0000000000096c2b	leaq	-0x20(%rbp), %rbx
0000000000096c2f	movq	%rbx, %rdi
0000000000096c32	callq	__ZNK8cc_YCbCrmlERK9cc_matrix   ## cc_YCbCr::operator*(cc_matrix const&) const
0000000000096c37	movlps	%xmm0, (%rbx)
0000000000096c3a	movq	%rax, 0x8(%rbx)
0000000000096c3e	movaps	-0x20(%rbp), %xmm0
0000000000096c42	movss	-0x18(%rbp), %xmm1
0000000000096c47	addq	$0x18, %rsp
0000000000096c4b	popq	%rbx
0000000000096c4c	popq	%rbp
0000000000096c4d	retq
