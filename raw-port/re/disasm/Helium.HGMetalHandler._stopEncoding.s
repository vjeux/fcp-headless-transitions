__ZN14HGMetalHandler13_stopEncodingEv:
000000000015def0	pushq	%rbp
000000000015def1	movq	%rsp, %rbp
000000000015def4	pushq	%rbx
000000000015def5	pushq	%rax
000000000015def6	movq	%rdi, %rbx
000000000015def9	callq	__ZN14HGMetalHandler28_setCommandEncoderDebugLabelEv ## HGMetalHandler::_setCommandEncoderDebugLabel()
000000000015defe	movq	0x108(%rbx), %rdi
000000000015df05	movq	0x8fd03c(%rip), %rsi            ## Objc selector ref: endEncoding
000000000015df0c	callq	*0x8a42a6(%rip)                 ## Objc message: -[%rdi endEncoding]
000000000015df12	incl	0x6f8(%rbx)
000000000015df18	movl	0x700(%rbx), %edx
000000000015df1e	incl	%edx
000000000015df20	movl	%edx, 0x700(%rbx)
000000000015df26	movq	0x90(%rbx), %rax
000000000015df2d	movl	0x3f8(%rax), %esi
000000000015df33	movl	$0x2b79494c, %edi               ## imm = 0x2B79494C
000000000015df38	xorl	%ecx, %ecx
000000000015df3a	xorl	%r8d, %r8d
000000000015df3d	addq	$0x8, %rsp
000000000015df41	popq	%rbx
000000000015df42	popq	%rbp
000000000015df43	jmp	0x3c53d2                        ## symbol stub for: _kdebug_trace
000000000015df48	nopl	(%rax,%rax)
