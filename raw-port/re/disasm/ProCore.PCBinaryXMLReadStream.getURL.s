__ZNK21PCBinaryXMLReadStream6getURLEv:
0000000000065290	pushq	%rbp
0000000000065291	movq	%rsp, %rbp
0000000000065294	pushq	%rbx
0000000000065295	pushq	%rax
0000000000065296	movq	%rdi, %rbx
0000000000065299	movq	0x98(%rdi), %rdi
00000000000652a0	leaq	__ZTI8PCStream(%rip), %rsi      ## typeinfo for PCStream
00000000000652a7	leaq	__ZTI16PCFileReadStream(%rip), %rdx ## typeinfo for PCFileReadStream
00000000000652ae	xorl	%ecx, %ecx
00000000000652b0	callq	0xde720                         ## symbol stub for: ___dynamic_cast
00000000000652b5	leaq	0x8(%rax), %rcx
00000000000652b9	addq	$0xa8, %rbx
00000000000652c0	testq	%rax, %rax
00000000000652c3	cmovneq	%rcx, %rbx
00000000000652c7	movq	%rbx, %rax
00000000000652ca	addq	$0x8, %rsp
00000000000652ce	popq	%rbx
00000000000652cf	popq	%rbp
00000000000652d0	retq
00000000000652d1	nop
