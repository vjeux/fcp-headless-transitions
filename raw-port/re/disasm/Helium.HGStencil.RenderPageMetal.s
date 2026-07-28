__ZN9HGStencil15RenderPageMetalEP6HGPage:
00000000002d24a0	pushq	%rbp
00000000002d24a1	movq	%rsp, %rbp
00000000002d24a4	pushq	%r14
00000000002d24a6	pushq	%rbx
00000000002d24a7	movq	%rsi, %rbx
00000000002d24aa	movq	%rdi, %r14
00000000002d24ad	movq	(%rdi), %rax
00000000002d24b0	xorl	%esi, %esi
00000000002d24b2	callq	*0x230(%rax)
00000000002d24b8	movq	%r14, %rdi
00000000002d24bb	movq	%rbx, %rsi
00000000002d24be	popq	%rbx
00000000002d24bf	popq	%r14
00000000002d24c1	popq	%rbp
00000000002d24c2	jmp	__ZN9HGStencil20RenderPagePlainMetalEP6HGPage ## HGStencil::RenderPagePlainMetal(HGPage*)
00000000002d24c7	nopw	(%rax,%rax)
