__ZN23HGMetalCommandBufferRefD1Ev:
00000000001d53a0	pushq	%rbp
00000000001d53a1	movq	%rsp, %rbp
00000000001d53a4	pushq	%rbx
00000000001d53a5	pushq	%rax
00000000001d53a6	movq	%rdi, %rbx
00000000001d53a9	movq	(%rdi), %rdi
00000000001d53ac	callq	*0x82ce0e(%rip)                 ## literal pool symbol address: _objc_release
00000000001d53b2	movq	$0x0, (%rbx)
00000000001d53b9	addq	$0x8, %rsp
00000000001d53bd	popq	%rbx
00000000001d53be	popq	%rbp
00000000001d53bf	retq
00000000001d53c0	movq	%rax, %rdi
00000000001d53c3	callq	___clang_call_terminate
00000000001d53c8	nopl	(%rax,%rax)
