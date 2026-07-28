__ZN15FFVTRAWRendererD0Ev:
0000000000764580	pushq	%rbp
0000000000764581	movq	%rsp, %rbp
0000000000764584	pushq	%rbx
0000000000764585	pushq	%rax
0000000000764586	movq	%rdi, %rbx
0000000000764589	leaq	0x11a1180(%rip), %rax
0000000000764590	movq	%rax, (%rdi)
0000000000764593	movq	0x8(%rdi), %rdi
0000000000764597	callq	*0x118916b(%rip)                ## literal pool symbol address: _objc_release
000000000076459d	movq	0x10(%rbx), %rdi
00000000007645a1	callq	*0x1189161(%rip)                ## literal pool symbol address: _objc_release
00000000007645a7	movq	%rbx, %rdi
00000000007645aa	addq	$0x8, %rsp
00000000007645ae	popq	%rbx
00000000007645af	popq	%rbp
00000000007645b0	jmp	0x1497404                       ## symbol stub for: __ZdlPv
00000000007645b5	movq	%rax, %rdi
00000000007645b8	callq	___clang_call_terminate
00000000007645bd	nopl	(%rax)
