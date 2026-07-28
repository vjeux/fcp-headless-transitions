__ZN16HgcSubtractAlphaC1Ev:
000000000146e8a0	pushq	%rbp
000000000146e8a1	movq	%rsp, %rbp
000000000146e8a4	pushq	%r14
000000000146e8a6	pushq	%rbx
000000000146e8a7	movq	%rdi, %rbx
000000000146e8aa	callq	0x1496c06                       ## symbol stub for: __ZN6HGNodeC2Ev
000000000146e8af	leaq	0x4c027a(%rip), %rax
000000000146e8b6	movq	%rax, (%rbx)
000000000146e8b9	movl	$0x47, %edi
000000000146e8be	callq	0x1497446                       ## symbol stub for: __Znam
000000000146e8c3	leaq	0x8(%rax), %rcx
000000000146e8c7	negl	%ecx
000000000146e8c9	andl	$0x1f, %ecx
000000000146e8cc	leaq	(%rcx,%rax), %rdx
000000000146e8d0	addq	$0x8, %rdx
000000000146e8d4	movq	%rax, (%rcx,%rax)
000000000146e8d8	xorps	%xmm0, %xmm0
000000000146e8db	movaps	%xmm0, 0x8(%rcx,%rax)
000000000146e8e0	movaps	%xmm0, 0x18(%rcx,%rax)
000000000146e8e5	movq	%rdx, 0x198(%rbx)
000000000146e8ec	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000146e8f1	andl	0x10(%rbx), %eax
000000000146e8f4	orl	$0x400, %eax                    ## imm = 0x400
000000000146e8f9	movl	%eax, 0x10(%rbx)
000000000146e8fc	popq	%rbx
000000000146e8fd	popq	%r14
000000000146e8ff	popq	%rbp
000000000146e900	retq
000000000146e901	movq	%rax, %r14
000000000146e904	movq	%rbx, %rdi
000000000146e907	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
000000000146e90c	movq	%r14, %rdi
000000000146e90f	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146e914	nopw	%cs:(%rax,%rax)
