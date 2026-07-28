__ZN20OZImageNodeRender36020estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE:
000000000041e210	pushq	%rbp
000000000041e211	movq	%rsp, %rbp
000000000041e214	pushq	%r14
000000000041e216	pushq	%rbx
000000000041e217	movq	%rdi, %r14
000000000041e21a	movq	0x10(%rdi), %rdi
000000000041e21e	testq	%rdi, %rdi
000000000041e221	je	0x41e256
000000000041e223	movq	%rsi, %rbx
000000000041e226	leaq	__ZTI9OZElement(%rip), %rsi     ## typeinfo for OZElement
000000000041e22d	leaq	__ZTI14OZImageElement(%rip), %rdx ## typeinfo for OZImageElement
000000000041e234	xorl	%ecx, %ecx
000000000041e236	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000041e23b	testq	%rax, %rax
000000000041e23e	je	0x41e256
000000000041e240	addq	$0x18, %r14
000000000041e244	movq	%rax, %rdi
000000000041e247	movq	%rbx, %rsi
000000000041e24a	movq	%r14, %rdx
000000000041e24d	popq	%rbx
000000000041e24e	popq	%r14
000000000041e250	popq	%rbp
000000000041e251	jmp	__ZN14OZImageElement20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEERK14OZRenderParams ## OZImageElement::estimateRenderMemory(std::__1::set<PCHash128, std::__1::less<PCHash128>, std::__1::allocator<PCHash128>>&, OZRenderParams const&)
000000000041e256	xorl	%eax, %eax
000000000041e258	popq	%rbx
000000000041e259	popq	%r14
000000000041e25b	popq	%rbp
000000000041e25c	retq
000000000041e25d	nopl	(%rax)
