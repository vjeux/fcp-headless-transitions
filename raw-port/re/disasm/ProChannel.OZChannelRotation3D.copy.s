__ZN19OZChannelRotation3D4copyEPK13OZChannelBaseb:
00000000000815f2	pushq	%rbp
00000000000815f3	movq	%rsp, %rbp
00000000000815f6	pushq	%r15
00000000000815f8	pushq	%r14
00000000000815fa	pushq	%rbx
00000000000815fb	pushq	%rax
00000000000815fc	movl	%edx, %r15d
00000000000815ff	movq	%rsi, %r14
0000000000081602	movq	%rdi, %rbx
0000000000081605	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
000000000008160a	testq	%r14, %r14
000000000008160d	je	0x8162c
000000000008160f	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000081616	leaq	__ZTI19OZChannelRotation3D(%rip), %rdx ## typeinfo for OZChannelRotation3D
000000000008161d	movq	%r14, %rdi
0000000000081620	xorl	%ecx, %ecx
0000000000081622	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000081627	movq	%rax, %r14
000000000008162a	jmp	0x8162f
000000000008162c	xorl	%r14d, %r14d
000000000008162f	movl	$0x88, %esi
0000000000081634	leaq	(%rbx,%rsi), %rdi
0000000000081638	addq	%r14, %rsi
000000000008163b	movzbl	%r15b, %r15d
000000000008163f	movl	%r15d, %edx
0000000000081642	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000081647	movl	$0x120, %esi                    ## imm = 0x120
000000000008164c	leaq	(%rbx,%rsi), %rdi
0000000000081650	addq	%r14, %rsi
0000000000081653	movl	%r15d, %edx
0000000000081656	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000008165b	movl	$0x1b8, %esi                    ## imm = 0x1B8
0000000000081660	leaq	(%rbx,%rsi), %rdi
0000000000081664	addq	%r14, %rsi
0000000000081667	movl	%r15d, %edx
000000000008166a	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000008166f	movl	$0x250, %eax                    ## imm = 0x250
0000000000081674	addq	%rax, %rbx
0000000000081677	addq	%rax, %r14
000000000008167a	movq	%rbx, %rdi
000000000008167d	movq	%r14, %rsi
0000000000081680	movl	%r15d, %edx
0000000000081683	addq	$0x8, %rsp
0000000000081687	popq	%rbx
0000000000081688	popq	%r14
000000000008168a	popq	%r15
000000000008168c	popq	%rbp
000000000008168d	jmp	__ZN13OZChannelEnum4copyEPK13OZChannelBaseb ## OZChannelEnum::copy(OZChannelBase const*, bool)
