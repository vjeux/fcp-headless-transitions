__ZN23HGMetalCommandBufferRefD2Ev:
00000000001d5370	pushq	%rbp
00000000001d5371	movq	%rsp, %rbp
00000000001d5374	pushq	%rbx
00000000001d5375	pushq	%rax
00000000001d5376	movq	%rdi, %rbx
00000000001d5379	movq	(%rdi), %rdi
00000000001d537c	callq	*0x82ce3e(%rip)                 ## literal pool symbol address: _objc_release
00000000001d5382	movq	$0x0, (%rbx)
00000000001d5389	addq	$0x8, %rsp
00000000001d538d	popq	%rbx
00000000001d538e	popq	%rbp
00000000001d538f	retq
00000000001d5390	movq	%rax, %rdi
00000000001d5393	callq	___clang_call_terminate
00000000001d5398	nopl	(%rax,%rax)
