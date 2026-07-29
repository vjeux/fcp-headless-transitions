__ZN17OZWriteOnBehavior17updateHiddenFlagsEPNSt3__14listIP10OZBehaviorNS0_9allocatorIS3_EEEE:
0000000000477070	pushq	%rbp
0000000000477071	movq	%rsp, %rbp
0000000000477074	pushq	%r15
0000000000477076	pushq	%r14
0000000000477078	pushq	%r13
000000000047707a	pushq	%r12
000000000047707c	pushq	%rbx
000000000047707d	pushq	%rax
000000000047707e	movq	%rsi, %rbx
0000000000477081	addq	$0x540, %rdi                    ## imm = 0x540
0000000000477088	movq	0x3ad481(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000047708f	xorps	%xmm0, %xmm0
0000000000477092	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000477097	movl	%eax, %r14d
000000000047709a	movq	0x8(%rbx), %r15
000000000047709e	cmpq	%rbx, %r15
00000000004770a1	je	0x4770f5
00000000004770a3	leaq	__ZTI17OZWriteOnBehavior(%rip), %r12 ## typeinfo for OZWriteOnBehavior
00000000004770aa	movq	0x3ad45f(%rip), %r13            ## literal pool symbol address: _kCMTimeZero
00000000004770b1	nopw	%cs:(%rax,%rax)
00000000004770c0	movq	0x10(%r15), %rdi
00000000004770c4	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
00000000004770cb	movq	%r12, %rdx
00000000004770ce	xorl	%ecx, %ecx
00000000004770d0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004770d5	leaq	0x540(%rax), %rdi
00000000004770dc	xorps	%xmm0, %xmm0
00000000004770df	movq	%r13, %rsi
00000000004770e2	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004770e7	cmpl	%eax, %r14d
00000000004770ea	jne	0x477157
00000000004770ec	movq	0x8(%r15), %r15
00000000004770f0	cmpq	%rbx, %r15
00000000004770f3	jne	0x4770c0
00000000004770f5	movq	0x8(%rbx), %r12
00000000004770f9	cmpq	%rbx, %r12
00000000004770fc	je	0x4771ff
0000000000477102	cmpl	$0x7, %r14d
0000000000477106	jne	0x4771b4
000000000047710c	leaq	__ZTI10OZBehavior(%rip), %r14   ## typeinfo for OZBehavior
0000000000477113	leaq	__ZTI17OZWriteOnBehavior(%rip), %r15 ## typeinfo for OZWriteOnBehavior
000000000047711a	nopw	(%rax,%rax)
0000000000477120	movq	0x10(%r12), %rdi
0000000000477125	movq	%r14, %rsi
0000000000477128	movq	%r15, %rdx
000000000047712b	xorl	%ecx, %ecx
000000000047712d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000477132	leaq	0x640(%rax), %rdi
0000000000477139	movl	$0x1, %esi
000000000047713e	movl	$0x1, %edx
0000000000477143	callq	0x6dd908                        ## symbol stub for: __ZN13OZChannelBase6enableEbb
0000000000477148	movq	0x8(%r12), %r12
000000000047714d	cmpq	%rbx, %r12
0000000000477150	jne	0x477120
0000000000477152	jmp	0x4771ff
0000000000477157	movq	0x8(%rbx), %r12
000000000047715b	cmpq	%rbx, %r12
000000000047715e	je	0x4771ff
0000000000477164	leaq	__ZTI10OZBehavior(%rip), %r14   ## typeinfo for OZBehavior
000000000047716b	leaq	__ZTI17OZWriteOnBehavior(%rip), %r15 ## typeinfo for OZWriteOnBehavior
0000000000477172	nopw	%cs:(%rax,%rax)
0000000000477180	movq	0x10(%r12), %rdi
0000000000477185	movq	%r14, %rsi
0000000000477188	movq	%r15, %rdx
000000000047718b	xorl	%ecx, %ecx
000000000047718d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000477192	leaq	0x640(%rax), %rdi
0000000000477199	movl	$0x1, %esi
000000000047719e	movl	$0x1, %edx
00000000004771a3	callq	0x6dd908                        ## symbol stub for: __ZN13OZChannelBase6enableEbb
00000000004771a8	movq	0x8(%r12), %r12
00000000004771ad	cmpq	%rbx, %r12
00000000004771b0	jne	0x477180
00000000004771b2	jmp	0x4771ff
00000000004771b4	leaq	__ZTI10OZBehavior(%rip), %r14   ## typeinfo for OZBehavior
00000000004771bb	leaq	__ZTI17OZWriteOnBehavior(%rip), %r15 ## typeinfo for OZWriteOnBehavior
00000000004771c2	nopw	%cs:(%rax,%rax)
00000000004771d0	movq	0x10(%r12), %rdi
00000000004771d5	movq	%r14, %rsi
00000000004771d8	movq	%r15, %rdx
00000000004771db	xorl	%ecx, %ecx
00000000004771dd	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004771e2	leaq	0x640(%rax), %rdi
00000000004771e9	xorl	%esi, %esi
00000000004771eb	movl	$0x1, %edx
00000000004771f0	callq	0x6dd908                        ## symbol stub for: __ZN13OZChannelBase6enableEbb
00000000004771f5	movq	0x8(%r12), %r12
00000000004771fa	cmpq	%rbx, %r12
00000000004771fd	jne	0x4771d0
00000000004771ff	addq	$0x8, %rsp
0000000000477203	popq	%rbx
0000000000477204	popq	%r12
0000000000477206	popq	%r13
0000000000477208	popq	%r14
000000000047720a	popq	%r15
000000000047720c	popq	%rbp
000000000047720d	retq
000000000047720e	nop
