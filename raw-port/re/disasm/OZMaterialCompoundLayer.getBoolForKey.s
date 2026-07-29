__ZN23OZMaterialCompoundLayer13getBoolForKeyEP8NSStringP12NSDictionaryb:
00000000001ff5c0	pushq	%rbp
00000000001ff5c1	movq	%rsp, %rbp
00000000001ff5c4	pushq	%rbx
00000000001ff5c5	pushq	%rax
00000000001ff5c6	movl	%ecx, %ebx
00000000001ff5c8	movq	%rdx, %rdi
00000000001ff5cb	movq	%rsi, %rdx
00000000001ff5ce	movq	0x7098eb(%rip), %rsi
00000000001ff5d5	callq	*0x626a4d(%rip)                 ## Objc message: -[%rdi getInitialValue:]
00000000001ff5db	testq	%rax, %rax
00000000001ff5de	je	0x1ff5f5
00000000001ff5e0	movq	0x709a51(%rip), %rsi
00000000001ff5e7	movq	%rax, %rdi
00000000001ff5ea	callq	*0x626a38(%rip)                 ## Objc message: -[%rdi getInitialValue:]
00000000001ff5f0	testb	%al, %al
00000000001ff5f2	setne	%bl
00000000001ff5f5	movl	%ebx, %eax
00000000001ff5f7	addq	$0x8, %rsp
00000000001ff5fb	popq	%rbx
00000000001ff5fc	popq	%rbp
00000000001ff5fd	retq
00000000001ff5fe	nop
