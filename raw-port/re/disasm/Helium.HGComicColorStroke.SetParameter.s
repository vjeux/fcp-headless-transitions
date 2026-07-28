__ZN18HGComicColorStroke12SetParameterEiffff:
00000000001bc140	pushq	%rbp
00000000001bc141	movq	%rsp, %rbp
00000000001bc144	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001bc149	testl	%esi, %esi
00000000001bc14b	je	0x1bc14f
00000000001bc14d	popq	%rbp
00000000001bc14e	retq
00000000001bc14f	ucomiss	0x198(%rdi), %xmm0
00000000001bc156	jne	0x1bc15a
00000000001bc158	jnp	0x1bc169
00000000001bc15a	movss	%xmm0, 0x198(%rdi)
00000000001bc162	movl	$0x1, %eax
00000000001bc167	popq	%rbp
00000000001bc168	retq
00000000001bc169	xorl	%eax, %eax
00000000001bc16b	popq	%rbp
00000000001bc16c	retq
00000000001bc16d	nopl	(%rax)
