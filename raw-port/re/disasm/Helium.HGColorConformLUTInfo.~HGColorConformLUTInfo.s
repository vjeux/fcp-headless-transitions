__ZN21HGColorConformLUTInfoD0Ev:
00000000001d2390	pushq	%rbp
00000000001d2391	movq	%rsp, %rbp
00000000001d2394	pushq	%rbx
00000000001d2395	pushq	%rax
00000000001d2396	movq	%rdi, %rbx
00000000001d2399	leaq	0x857c88(%rip), %rax
00000000001d23a0	movq	%rax, (%rdi)
00000000001d23a3	movq	0x38(%rdi), %rdi
00000000001d23a7	testq	%rdi, %rdi
00000000001d23aa	je	0x1d23b5
00000000001d23ac	movq	%rdi, 0x40(%rbx)
00000000001d23b0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d23b5	movq	0x28(%rbx), %rdi
00000000001d23b9	testq	%rdi, %rdi
00000000001d23bc	je	0x1d23c4
00000000001d23be	movq	(%rdi), %rax
00000000001d23c1	callq	*0x18(%rax)
00000000001d23c4	movq	%rbx, %rdi
00000000001d23c7	addq	$0x8, %rsp
00000000001d23cb	popq	%rbx
00000000001d23cc	popq	%rbp
00000000001d23cd	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d23d2	movq	%rax, %rdi
00000000001d23d5	callq	___clang_call_terminate
00000000001d23da	nopw	(%rax,%rax)
