__ZN24PCICCTransferFunctionLUTD0Ev:
0000000000013914	pushq	%rbp
0000000000013915	movq	%rsp, %rbp
0000000000013918	pushq	%rbx
0000000000013919	pushq	%rax
000000000001391a	movq	%rdi, %rbx
000000000001391d	leaq	0x1354a4(%rip), %rax
0000000000013924	movq	%rax, (%rdi)
0000000000013927	movq	0x8(%rdi), %rdi
000000000001392b	testq	%rdi, %rdi
000000000001392e	je	0x13939
0000000000013930	movq	%rdi, 0x10(%rbx)
0000000000013934	callq	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000013939	movq	%rbx, %rdi
000000000001393c	addq	$0x8, %rsp
0000000000013940	popq	%rbx
0000000000013941	popq	%rbp
0000000000013942	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000013947	nop
