__ZN6OZCropD0Ev:
000000000041ec50	pushq	%rbp
000000000041ec51	movq	%rsp, %rbp
000000000041ec54	pushq	%rbx
000000000041ec55	pushq	%rax
000000000041ec56	movq	%rdi, %rbx
000000000041ec59	leaq	0x4426f8(%rip), %rax
000000000041ec60	movq	%rax, (%rdi)
000000000041ec63	leaq	0x4427d6(%rip), %rax
000000000041ec6a	movq	%rax, 0x48(%rdi)
000000000041ec6e	addq	$0x18, %rdi
000000000041ec72	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000041ec77	leaq	0x442692(%rip), %rsi
000000000041ec7e	movq	%rbx, %rdi
000000000041ec81	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
000000000041ec86	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
000000000041ec8d	addq	$0x10, %rax
000000000041ec91	movq	%rax, 0x48(%rbx)
000000000041ec95	movq	0x50(%rbx), %rdi
000000000041ec99	testq	%rdi, %rdi
000000000041ec9c	je	0x41eca3
000000000041ec9e	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
000000000041eca3	movq	%rbx, %rdi
000000000041eca6	addq	$0x8, %rsp
000000000041ecaa	popq	%rbx
000000000041ecab	popq	%rbp
000000000041ecac	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000041ecb1	movq	%rax, %rdi
000000000041ecb4	callq	___clang_call_terminate
000000000041ecb9	nopl	(%rax)
