__ZN11CorrelationD0Ev:
00000000012219c0	pushq	%rbp
00000000012219c1	movq	%rsp, %rbp
00000000012219c4	pushq	%rbx
00000000012219c5	pushq	%rax
00000000012219c6	movq	%rdi, %rbx
00000000012219c9	leaq	0x6fbc70(%rip), %rax
00000000012219d0	movq	%rax, (%rdi)
00000000012219d3	movq	0x8(%rdi), %rdi
00000000012219d7	testq	%rdi, %rdi
00000000012219da	je	0x12219e1
00000000012219dc	callq	0x14973fe                       ## symbol stub for: __ZdaPv
00000000012219e1	movq	0x10(%rbx), %rdi
00000000012219e5	testq	%rdi, %rdi
00000000012219e8	je	0x12219ef
00000000012219ea	callq	0x14973fe                       ## symbol stub for: __ZdaPv
00000000012219ef	movq	0x28(%rbx), %rdi
00000000012219f3	testq	%rdi, %rdi
00000000012219f6	je	0x12219fd
00000000012219f8	callq	0x14973fe                       ## symbol stub for: __ZdaPv
00000000012219fd	movq	0x40(%rbx), %rdi
0000000001221a01	testq	%rdi, %rdi
0000000001221a04	je	0x1221a0b
0000000001221a06	callq	0x149776a                       ## symbol stub for: _free
0000000001221a0b	movq	%rbx, %rdi
0000000001221a0e	addq	$0x8, %rsp
0000000001221a12	popq	%rbx
0000000001221a13	popq	%rbp
0000000001221a14	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000001221a19	nopl	(%rax)
