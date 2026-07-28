__ZN16HgcMultiplyAlphaC1Ev:
0000000001469260	pushq	%rbp
0000000001469261	movq	%rsp, %rbp
0000000001469264	pushq	%r14
0000000001469266	pushq	%rbx
0000000001469267	movq	%rdi, %rbx
000000000146926a	callq	0x1496c06                       ## symbol stub for: __ZN6HGNodeC2Ev
000000000146926f	leaq	0x4c4aaa(%rip), %rax
0000000001469276	movq	%rax, (%rbx)
0000000001469279	movl	$0x28, %edi
000000000146927e	callq	0x1497446                       ## symbol stub for: __Znam
0000000001469283	leaq	0x8(%rax), %rcx
0000000001469287	negl	%ecx
0000000001469289	andl	$0x1f, %ecx
000000000146928c	leaq	(%rcx,%rax), %rdx
0000000001469290	addq	$0x8, %rdx
0000000001469294	movq	%rax, (%rcx,%rax)
0000000001469298	movq	%rdx, 0x198(%rbx)
000000000146929f	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
00000000014692a4	andl	0x10(%rbx), %eax
00000000014692a7	orl	$0x400, %eax                    ## imm = 0x400
00000000014692ac	movl	%eax, 0x10(%rbx)
00000000014692af	popq	%rbx
00000000014692b0	popq	%r14
00000000014692b2	popq	%rbp
00000000014692b3	retq
00000000014692b4	movq	%rax, %r14
00000000014692b7	movq	%rbx, %rdi
00000000014692ba	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
00000000014692bf	movq	%r14, %rdi
00000000014692c2	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000014692c7	nopw	(%rax,%rax)
