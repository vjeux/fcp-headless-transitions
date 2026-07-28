__ZNK14HGShaderTiling6valuesEb:
00000000000c7a00	pushq	%rbp
00000000000c7a01	movq	%rsp, %rbp
00000000000c7a04	xorl	%eax, %eax
00000000000c7a06	testl	%esi, %esi
00000000000c7a08	je	0xc7a13
00000000000c7a0a	testb	$0x8, 0x2b(%rdi)
00000000000c7a0e	je	0xc7a13
00000000000c7a10	movl	0x4c(%rdi), %eax
00000000000c7a13	popq	%rbp
00000000000c7a14	retq
00000000000c7a15	nopw	%cs:(%rax,%rax)
