__ZN17PCByteWriteStreamD0Ev:
000000000002330e	pushq	%rbp
000000000002330f	movq	%rsp, %rbp
0000000000023312	pushq	%rbx
0000000000023313	pushq	%rax
0000000000023314	movq	%rdi, %rbx
0000000000023317	leaq	0x1261ba(%rip), %rax
000000000002331e	movq	%rax, (%rdi)
0000000000023321	movq	0x20(%rdi), %rdi
0000000000023325	testq	%rdi, %rdi
0000000000023328	je	0x2332f
000000000002332a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000002332f	movq	%rbx, %rdi
0000000000023332	addq	$0x8, %rsp
0000000000023336	popq	%rbx
0000000000023337	popq	%rbp
0000000000023338	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
000000000002333d	nop
