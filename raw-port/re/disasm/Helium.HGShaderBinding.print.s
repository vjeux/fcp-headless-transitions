__ZNK15HGShaderBinding5printEv:
00000000000a7720	pushq	%rbp
00000000000a7721	movq	%rsp, %rbp
00000000000a7724	pushq	%r14
00000000000a7726	pushq	%rbx
00000000000a7727	movq	%rdi, %r14
00000000000a772a	leaq	0x83dc19(%rip), %rbx            ## literal pool for: "----------------------------------"
00000000000a7731	movq	%rbx, %rdi
00000000000a7734	callq	0x3c55be                        ## symbol stub for: _puts
00000000000a7739	movl	(%r14), %esi
00000000000a773c	leaq	0x834c42(%rip), %rdi            ## literal pool for: "base_array       = %d\n"
00000000000a7743	xorl	%eax, %eax
00000000000a7745	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a774a	movl	0x4(%r14), %esi
00000000000a774e	leaq	0x834c47(%rip), %rdi            ## literal pool for: "base_constant    = %d\n"
00000000000a7755	xorl	%eax, %eax
00000000000a7757	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a775c	movl	0x8(%r14), %esi
00000000000a7760	leaq	0x834c4c(%rip), %rdi            ## literal pool for: "base_texcoord    = %d\n"
00000000000a7767	xorl	%eax, %eax
00000000000a7769	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a776e	movl	0xc(%r14), %esi
00000000000a7772	leaq	0x834c51(%rip), %rdi            ## literal pool for: "base_output      = %d\n"
00000000000a7779	xorl	%eax, %eax
00000000000a777b	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a7780	movl	0x10(%r14), %esi
00000000000a7784	leaq	0x834c56(%rip), %rdi            ## literal pool for: "base_param       = %d\n"
00000000000a778b	xorl	%eax, %eax
00000000000a778d	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a7792	movl	0x14(%r14), %esi
00000000000a7796	leaq	0x834c5b(%rip), %rdi            ## literal pool for: "base_param_bytes = %d\n"
00000000000a779d	xorl	%eax, %eax
00000000000a779f	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a77a4	movl	0x18(%r14), %esi
00000000000a77a8	leaq	0x834c60(%rip), %rdi            ## literal pool for: "base_texture     = %d\n"
00000000000a77af	xorl	%eax, %eax
00000000000a77b1	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a77b6	movl	0x1c(%r14), %esi
00000000000a77ba	leaq	0x834c65(%rip), %rdi            ## literal pool for: "dead_input       = %d\n"
00000000000a77c1	xorl	%eax, %eax
00000000000a77c3	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a77c8	movl	0x20(%r14), %esi
00000000000a77cc	leaq	0x834c6a(%rip), %rdi            ## literal pool for: "dead_inputs      = %d\n"
00000000000a77d3	xorl	%eax, %eax
00000000000a77d5	callq	0x3c54f8                        ## symbol stub for: _printf
00000000000a77da	movq	%rbx, %rdi
00000000000a77dd	popq	%rbx
00000000000a77de	popq	%r14
00000000000a77e0	popq	%rbp
00000000000a77e1	jmp	0x3c55be                        ## symbol stub for: _puts
00000000000a77e6	nopw	%cs:(%rax,%rax)
