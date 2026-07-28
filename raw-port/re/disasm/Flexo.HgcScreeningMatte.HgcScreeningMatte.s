__ZN17HgcScreeningMatteC1Ev:
000000000146d1e0	pushq	%rbp
000000000146d1e1	movq	%rsp, %rbp
000000000146d1e4	pushq	%r14
000000000146d1e6	pushq	%rbx
000000000146d1e7	movq	%rdi, %rbx
000000000146d1ea	callq	0x1496c06                       ## symbol stub for: __ZN6HGNodeC2Ev
000000000146d1ef	leaq	0x4c148a(%rip), %rax
000000000146d1f6	movq	%rax, (%rbx)
000000000146d1f9	movl	$0x127, %edi                    ## imm = 0x127
000000000146d1fe	callq	0x1497446                       ## symbol stub for: __Znam
000000000146d203	leaq	0x8(%rax), %rcx
000000000146d207	negl	%ecx
000000000146d209	andl	$0x1f, %ecx
000000000146d20c	leaq	(%rcx,%rax), %rdx
000000000146d210	addq	$0x8, %rdx
000000000146d214	movq	%rax, (%rcx,%rax)
000000000146d218	xorps	%xmm0, %xmm0
000000000146d21b	movaps	%xmm0, 0x8(%rcx,%rax)
000000000146d220	movaps	%xmm0, 0x18(%rcx,%rax)
000000000146d225	movaps	0x10f0f4(%rip), %xmm1
000000000146d22c	movaps	%xmm1, 0x38(%rcx,%rax)
000000000146d231	movaps	%xmm1, 0x28(%rcx,%rax)
000000000146d236	movaps	0x11c873(%rip), %xmm1
000000000146d23d	movaps	%xmm1, 0x58(%rcx,%rax)
000000000146d242	movaps	%xmm1, 0x48(%rcx,%rax)
000000000146d247	movaps	0x11c872(%rip), %xmm1
000000000146d24e	movaps	%xmm1, 0x78(%rcx,%rax)
000000000146d253	movaps	%xmm1, 0x68(%rcx,%rax)
000000000146d258	movaps	0x11c871(%rip), %xmm1
000000000146d25f	movaps	%xmm1, 0x98(%rcx,%rax)
000000000146d267	movaps	%xmm1, 0x88(%rcx,%rax)
000000000146d26f	movaps	%xmm0, 0xa8(%rcx,%rax)
000000000146d277	movaps	%xmm0, 0xb8(%rcx,%rax)
000000000146d27f	movaps	0x11bdba(%rip), %xmm1
000000000146d286	movaps	%xmm1, 0xd8(%rcx,%rax)
000000000146d28e	movaps	%xmm1, 0xc8(%rcx,%rax)
000000000146d296	movaps	%xmm0, 0xe8(%rcx,%rax)
000000000146d29e	movq	%rdx, 0x198(%rbx)
000000000146d2a5	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000146d2aa	andl	0x10(%rbx), %eax
000000000146d2ad	orl	$0x400, %eax                    ## imm = 0x400
000000000146d2b2	movl	%eax, 0x10(%rbx)
000000000146d2b5	popq	%rbx
000000000146d2b6	popq	%r14
000000000146d2b8	popq	%rbp
000000000146d2b9	retq
000000000146d2ba	movq	%rax, %r14
000000000146d2bd	movq	%rbx, %rdi
000000000146d2c0	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
000000000146d2c5	movq	%r14, %rdi
000000000146d2c8	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146d2cd	nopl	(%rax)
