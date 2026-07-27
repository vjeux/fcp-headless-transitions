/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone (architecture x86_64):
(__TEXT,__text) section
__ZN14PMFrameRequestC2ERKS_:
00000000000c1910	pushq	%rbp
00000000000c1911	movq	%rsp, %rbp
00000000000c1914	pushq	%r15
00000000000c1916	pushq	%r14
00000000000c1918	pushq	%rbx
00000000000c1919	pushq	%rax
00000000000c191a	movq	%rsi, %r14
00000000000c191d	movq	%rdi, %rbx
00000000000c1920	movups	(%rsi), %xmm0
00000000000c1923	movups	%xmm0, (%rdi)
00000000000c1926	movsd	0x10(%rsi), %xmm0
00000000000c192b	movsd	%xmm0, 0x10(%rdi)
00000000000c1930	movsd	0x18(%rsi), %xmm0
00000000000c1935	movsd	%xmm0, 0x18(%rdi)
00000000000c193a	movsd	0x20(%rsi), %xmm0
00000000000c193f	movsd	%xmm0, 0x20(%rdi)
00000000000c1944	movsd	0x28(%rsi), %xmm0
00000000000c1949	movsd	%xmm0, 0x28(%rdi)
00000000000c194e	movsd	0x30(%rsi), %xmm0
00000000000c1953	movsd	%xmm0, 0x30(%rdi)
00000000000c1958	movsd	0x38(%rsi), %xmm0
00000000000c195d	movsd	%xmm0, 0x38(%rdi)
00000000000c1962	movsd	0x40(%rsi), %xmm0
00000000000c1967	movsd	%xmm0, 0x40(%rdi)
00000000000c196c	movsd	0x48(%rsi), %xmm0
00000000000c1971	movsd	%xmm0, 0x48(%rdi)
00000000000c1976	movsd	0x50(%rsi), %xmm0
00000000000c197b	movsd	%xmm0, 0x50(%rdi)
00000000000c1980	movups	0x58(%rsi), %xmm0
00000000000c1984	movups	0x68(%rsi), %xmm1
00000000000c1988	movups	0x78(%rsi), %xmm2
00000000000c198c	movups	%xmm0, 0x58(%rdi)
00000000000c1990	movups	%xmm1, 0x68(%rdi)
00000000000c1994	movups	%xmm2, 0x78(%rdi)
00000000000c1998	movq	0x88(%rsi), %rdi
00000000000c199f	movq	%rdi, 0x88(%rbx)
00000000000c19a6	testq	%rdi, %rdi
00000000000c19a9	je	0xc19b0
00000000000c19ab	callq	0x6dda94                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
00000000000c19b0	movups	0xf9(%r14), %xmm0
00000000000c19b8	movups	%xmm0, 0xf9(%rbx)
00000000000c19bf	movups	0xf0(%r14), %xmm0
00000000000c19c7	movups	%xmm0, 0xf0(%rbx)
00000000000c19ce	movups	0xe0(%r14), %xmm0
00000000000c19d6	movups	%xmm0, 0xe0(%rbx)
00000000000c19dd	movups	0xd0(%r14), %xmm0
00000000000c19e5	movups	%xmm0, 0xd0(%rbx)
00000000000c19ec	movups	0x90(%r14), %xmm0
00000000000c19f4	movups	0xa0(%r14), %xmm1
00000000000c19fc	movups	0xb0(%r14), %xmm2
00000000000c1a04	movups	0xc0(%r14), %xmm3
00000000000c1a0c	movups	%xmm3, 0xc0(%rbx)
00000000000c1a13	movups	%xmm2, 0xb0(%rbx)
00000000000c1a1a	movups	%xmm1, 0xa0(%rbx)
00000000000c1a21	movups	%xmm0, 0x90(%rbx)
00000000000c1a28	movq	0x110(%r14), %rdi
00000000000c1a2f	movq	%rdi, 0x110(%rbx)
00000000000c1a36	testq	%rdi, %rdi
00000000000c1a39	je	0xc1a40
00000000000c1a3b	callq	0x6dda94                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
00000000000c1a40	movq	0x118(%r14), %rdi
00000000000c1a47	movq	%rdi, 0x118(%rbx)
00000000000c1a4e	testq	%rdi, %rdi
00000000000c1a51	je	0xc1a58
00000000000c1a53	callq	0x6dda94                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
00000000000c1a58	movq	0x130(%r14), %rax
00000000000c1a5f	movq	%rax, 0x130(%rbx)
00000000000c1a66	movups	0x120(%r14), %xmm0
00000000000c1a6e	movups	%xmm0, 0x120(%rbx)
00000000000c1a75	leaq	0x138(%rbx), %r15
00000000000c1a7c	movq	0x138(%r14), %rax
00000000000c1a83	movq	%rax, 0x138(%rbx)
00000000000c1a8a	movq	%r15, %rdi
00000000000c1a8d	callq	0x6df51c                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
00000000000c1a92	leaq	0x140(%rbx), %rdi
00000000000c1a99	movq	0x140(%r14), %rax
00000000000c1aa0	movq	%rax, 0x140(%rbx)
00000000000c1aa7	callq	0x6df51c                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
00000000000c1aac	movups	0x148(%r14), %xmm0
00000000000c1ab4	movups	0x158(%r14), %xmm1
00000000000c1abc	movups	%xmm1, 0x158(%rbx)
00000000000c1ac3	movups	%xmm0, 0x148(%rbx)
00000000000c1aca	addq	$0x8, %rsp
00000000000c1ace	popq	%rbx
00000000000c1acf	popq	%r14
00000000000c1ad1	popq	%r15
00000000000c1ad3	popq	%rbp
00000000000c1ad4	retq
00000000000c1ad5	movq	%rax, %r14
00000000000c1ad8	jmp	0xc1b03
00000000000c1ada	movq	%rax, %r14
00000000000c1add	jmp	0xc1b0f
00000000000c1adf	movq	%rax, %r14
00000000000c1ae2	movq	%r15, %rdi
00000000000c1ae5	callq	0x6df522                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000000c1aea	jmp	0xc1af7
00000000000c1aec	movq	%rax, %rdi
